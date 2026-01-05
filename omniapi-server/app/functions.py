from fastapi import HTTPException
from app.models.job import Job, JobStatus
from uuid import uuid4
from app.models.file import File_Table
from sqlmodel import select
from app.worker import upload_file, download_file, upload_chunk1, upload_chunk2, stitch_chunk, compressTask, convertTask, cut_and_combine, get_duration, crop_video, overlay_image, overlay_text
from celery import chain
import re
import ffmpeg
import shutil
import os
import tempfile
import redis
import json
r = redis.Redis(host="localhost", port=6379, decode_responses=True)
def getJobStatus(job_id, session):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job.id,
        "status": job.status,
        "operation": job.operation
    }

def handle_upload(file, location, session):
    file_id = str(uuid4())
    job_id = str(uuid4())
    task_id = str(uuid4())

    # 2. Save to disk immediately (Fast I/O)
    temp_file_path = f"/tmp/{file_id}_{file.filename}"

    # optimization: shutil.copyfileobj streams data, unlike file.read() which loads all to RAM
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Get size from the saved file
    file_size = os.path.getsize(temp_file_path)

    if file_size > 100 * 1024 * 1024:
        os.remove(temp_file_path) # Cleanup
        raise HTTPException(status_code=413, detail="File bigger than 100MB")

    # 3. DB Operations
    job = Job(id=job_id, task_id=task_id, status=JobStatus.processing, operation="uploading_file")
    file_type = str(file.filename).split(".")[-1]
    file_table = File_Table(id=file_id, name=file.filename, size=file_size, content_type=file_type)

    session.add(job)
    session.add(file_table)
    session.commit()

    # 4. Send PATH to worker, not CONTENT
    # This payload is now tiny (bytes), so the handoff to Redis is instant.
    upload_file.delay(temp_file_path, job_id, file_id, location)

    return {"job_id": job_id, "file_id": file_id, "task_id": task_id}

def check_job_done(session, job_id):
    job = session.get(Job, job_id)
    if str(job.status) == str(JobStatus.finished):
        return True
    return False

def handle_download(file_id, session):
    filename = session.exec(select(File_Table).where(File_Table.id == file_id)).first()
    if not filename:
        raise HTTPException(status_code=404, detail="File not found")
    return download_file(file_id, filename.name)

def handle_upload_chunk(user_input, session):
    filename = user_input.get("filename")
    filetype = user_input.get("type")
    num_chunks = user_input.get("num_chunks")
    if not filename or not filetype or not num_chunks:
        raise HTTPException(status_code=400, detail="Missing required fields.")
    file_id = str(uuid4())
    file_entry = File_Table(id=file_id, name=filename, content_type=filetype, size = 0)
    job_entry = Job(id = file_id, status = JobStatus.processing, operation="uploading_chunk")
    session.add(job_entry)
    session.add(file_entry)
    session.commit()
    redis_obj = {
        "num_batches": num_chunks,
        "batches": list(range(1, num_chunks + 1))
    }
    r.set(file_id, json.dumps(redis_obj))
    return {"id": file_id}

def handle_upload_part(file_id, chunk_num,chunk):
    chunk_bytes = chunk.file.read()
    redis_key = f"upload:{file_id}"
    
    # Get or create multipart upload
    upload_state = r.get(redis_key)
    
    if upload_state:
        upload_state = json.loads(upload_state)
        upload_id = upload_state["upload_id"]
    else:
        # Initiate multipart upload
        response = upload_chunk1(file_id)
        upload_id = response["UploadId"]

        # Save state in Redis
        upload_state = {
            "upload_id": upload_id,
            "parts": []
        }

    # Upload part
    response = upload_chunk2(upload_id, file_id, chunk_num, chunk_bytes)

    # Record part info (must be sorted later by PartNumber)
    upload_state["parts"].append({
        "ETag": response["ETag"],
        "PartNumber": chunk_num
    })

    # Save back to Redis
    r.set(f"upload:{file_id}", json.dumps(upload_state))

def handle_stitch(file_id, session):
    upload_state_raw = r.get(f"upload:{file_id}")
    if not upload_state_raw:
        raise HTTPException(status_code=404, detail="Upload state not found")

    upload_state = json.loads(upload_state_raw)
    upload_id = upload_state["upload_id"]
    parts = sorted(upload_state["parts"], key=lambda p: p["PartNumber"])

    size = stitch_chunk(file_id, upload_id, parts)

    # Optional: update DB size column # adjust this import to your project

    file = session.get(File_Table, file_id)
    if file:
        file.size = size
        session.commit()

    r.delete(f"upload:{file_id}:id")
    r.delete(f"upload:{file_id}:parts")

def handle_compress(file_id, type_file, level, zip_flag, g_zip_flag, file, session):
    print("------------------------------------------------------------------------")
    
    job_id = str(uuid4())        # Track this job
    compress_id = str(uuid4())   # ID for compressed output
    
    # Add Job entry
    session.add(Job(id=job_id, status=JobStatus.processing, operation="compress_file"))

    if not file_id:
        print("UPLOAD FILE START")
        file_id = str(uuid4())  # ID for the uploaded file

        # Save File metadata before actual upload
        file_type = str(file.filename).split(".")[-1]
        session.add(File_Table(
            id=file_id,
            name=file.filename,
            size=len(file.file.read()),
            content_type=file_type
        ))
        session.commit()

        # Reset file pointer after reading
        file.file.seek(0)

        # Chain upload and compress
        chain(
            upload_file.s(file.file.read(), file.filename, file_id),
            compressTask.s(type_file, level, zip_flag, g_zip_flag, job_id, compress_id)
        )()

    else:
        print("COMPRESS ONLY START")
        session.commit()

        # Only compress (file already uploaded)
        compressTask.delay(file_id, type_file, level, zip_flag, g_zip_flag, job_id, compress_id)

    return {
        "job_id": job_id,
        "file_id": compress_id
    }
def handle_convert(file_id, file_type, to_type,location, task_id,session):
    print("------------------------------------------------------------------------")
    print(file_id + file_type+ to_type )
    job_id = str(uuid4())         # ID for the conversion job
    converted_id = str(uuid4())   # ID for converted file
    curr_file = session.get(File_Table, file_id)
    file_name = str(curr_file.name).rsplit(".", 1)[0] + '_cut'
    session.add(Job(id=job_id, task_id= task_id,status=JobStatus.processing, operation="convert_file"))
    file = File_Table(
        id=f"{converted_id}",
        name=file_name,
        size=0,
        content_type=to_type,
    )
    session.add(file)
    print("CONVERT ONLY START")
    session.commit()

        # If file already uploaded, just convert
    convertTask.delay(file_id, file_type, to_type, job_id, converted_id,location)
    return {
        "job_id": job_id,
        "file_id": converted_id
        }
def handle_edit_video(file_id, start_times, end_times, location,  session, task_id):
    job_id = str(uuid4())
    cut_video_id = str(uuid4())
    session.add(Job(id=job_id, status=JobStatus.processing, operation="edit_video", task_id=task_id)) 
    session.commit()
    cut_and_combine.delay(file_id, start_times,end_times, job_id, cut_video_id, location)
                
    return {"file_id": cut_video_id,
            "job_id": job_id}


def check_json(parameter):
    try:
        return json.loads(parameter)
    except json.JSONDecodeError:
        return False


def check_format(time_input, pattern):
    return bool(re.fullmatch(pattern, time_input))

def get_uploaded_video_duration(file):
    try:
        # Save to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Probe the temporary file
        probe = ffmpeg.probe(tmp_path)
        duration = float(probe['format']['duration'])

        return duration

    except Exception as e:
        print("Error getting duration:", e)
        return None

def flip_values(start2,end2,flip_start_values, flip_end_values, duration):

    if min(start2) != 0:
        flip_start_values.append(0)
        for i,j in zip(start2,end2):
            flip_start_values.append(j)
            flip_end_values.append(i)
    if flip_end_values[-1] != duration:
        flip_end_values.append(duration)
    return {"start": flip_start_values,
            "end": flip_end_values}

def convert_time(time):
    if time[-1] == "s":
        return int(time[:-1])
    elif time[-1] == "m":
        return int(time[:-1]) * 60
    elif time[-1] == "h":
        return int(time[:-1]) * 3600
    return 0


def time_seconds(t):
    hours, minutes, seconds = map(int, t.split(":"))
    return hours * 3600 + minutes * 60 + seconds


def check_input(data):
    pattern_hms = r"(\d{2}):(\d{2}):(\d{2})"
    pattern_shorthand = r'^\d{2}[smh]$'
    from_time = data.get("from", [])
    to_time = data.get("to", [])

    if len(from_time) != len(to_time):
        print("--------------------------------------------------------------------------")
        print("INCORRECT LENGTH")
        return False

    if check_format(from_time[0], pattern_hms):
        for time, time2 in zip(from_time, to_time):
            if not check_format(time, pattern_hms) or not check_format(time2, pattern_hms):
                print("--------------------------------------------------------------------------")
                print("INCORECT FORMAT")
                return False
            if time_seconds(time2) <= time_seconds(time):
                print("--------------------------------------------------------------------------")
                print("SMALLER")
                return False

    elif check_format(from_time[0], pattern_shorthand):
        for time, time2 in zip(from_time, to_time):
            if not check_format(time, pattern_shorthand) or not check_format(time2, pattern_shorthand):
                print("--------------------------------------------------------------------------")
                print("INCORECCT FORMAT for smh")
                return False
            if convert_time(time2) <= convert_time(time):
                print("--------------------------------------------------------------------------")
                print("SMALLER TIME for SMH")
                return False
    else:
        print("--------------------------------------------------------------------------")
        print("NO VALID FORMAT ENTERED")
        return False

    return True

def check_crop(file_id,width, height, x, y, location, session, task_id):
    job_id = str(uuid4())
    crop_id = str(uuid4())
    session.add(Job(id=job_id, status=JobStatus.processing, operation="cropping_video", task_id= task_id)) 
    session.commit()
    crop_video.delay(file_id, width, height, x, y ,job_id, crop_id, location)
    
    return {"file_id": crop_id,
            "job_id": job_id}

def check_overlay(file_id,image_id, image, file, session):
    job_id = str(uuid4())
    overlay_id = str(uuid4())
    file_type = str(file.filename).split(".")[-1]
    file_bytes = file.file.read()
    file_name = str(file.filename).split(".")[0]
    if not image_id:
        image_id = str(uuid4())
        image_bytes = image.file.read()
        image_name = str(image.filename).split(".")[0]
        image_type = str(image.filename).split(".")[-1]
        session.add(File_Table(
            id=image_id,
            name=image_name,
            size=len(image_bytes),
            content_type=image_type
        ))
        upload_file(image_bytes, image_name, image_id)
    if not file_id:
        file_id = str(uuid4())
        session.add(File_Table(
            id=file_id,
            name=file_name,
            size=len(file_bytes),
            content_type=file_type
        ))
        chain(
            upload_file.s(file_bytes, file_name, file_id),
            overlay_image.s(job_id, image_id, overlay_id, file_name, file_type)
        )()
    else: 
        overlay_image(file_id, job_id, image_id, overlay_id,file_name, file_type)
    session.add(Job(id=job_id, status=JobStatus.processing, operation="overlay_video")) 
    session.commit()
    return overlay_id

def check_text(file_id, text, x_pos, y_pos, font_size, font, color, location,session,task_id):
    job_id = str(uuid4())
    text_id = str(uuid4())

    # Create job
    session.add(Job(id=job_id, status=JobStatus.processing, operation="overlay_text", task_id = task_id))
    session.commit()

    # Queue Celery task
    overlay_text.delay(file_id, job_id, text, text_id, x_pos, y_pos, font_size, font, color,location)

    return {"file_id": text_id,
            "job_id": job_id}

