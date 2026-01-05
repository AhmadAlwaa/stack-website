from celery import Celery
import os, zipfile, gzip, shutil
import hashlib
from uuid import uuid4
import base64
import time
import bcrypt
from botocore.config import Config
from botocore.exceptions import ClientError
import boto3
from PIL import Image
from pdf2image import convert_from_path
from datetime import datetime, timedelta
from celery.schedules import crontab
from fastapi.responses import StreamingResponse
from fastapi import HTTPException
from sqlmodel import Session, select
from app.models.file import File_Table
from app.models.shareLink import shareLink
import mimetypes
from io import BytesIO
import tempfile
from app.fontPaths import FONT_MAP
from app.database import get_sync_session, engine
import ffmpeg
from app.models.job import Job, JobStatus
celery = Celery(__name__)
celery.conf.broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
celery.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379")
S3_ENDPOINT_URL = "http://10.0.0.21:3900"
AWS_ACCESS_KEY_ID = "GK2278bf8785a6d66fdda7b1dd"
AWS_SECRET_ACCESS_KEY = "b7cefa63d6d012c63b4224bdde2999f3e5467f955248eb2034f14bd534d04bfc"
BUCKET_NAME = "omniapi"
MULTIPART_PREFIX = "upload"
S3_CONFIG = Config(
    connect_timeout=5,   # seconds for connect
    read_timeout=30,     # seconds for read
    retries={"max_attempts": 3, "mode": "standard"},
)

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT_URL,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name="garage",
    config=S3_CONFIG,     # <-- added config here
)

@celery.task(name="upload_file")
def upload_file(file_path: str, job_id: str, file_id: str, location: str):
    db = get_sync_session()
    job = db.get(Job, job_id)
    
    try:
        # Upload directly from disk using the path (Efficient)
        s3.upload_file(file_path, BUCKET_NAME, Key=f"{location}/{file_id}")

        if job:
            job.status = JobStatus.finished
            db.commit()

    except Exception as e:
        print(f"UPLOAD FAILED: {e}") # Log it for yourself
        if job:
            job.status = JobStatus.failed # Update DB so the UI knows it failed
            # job.error_message = str(e) # Optional: if you have an error column
            db.commit()
            
    finally:
        # ALWAYS clean up the temp file, even if upload crashes
        if os.path.exists(file_path):
            os.remove(file_path)
        
        db.close()
def download_file(id, location):
    try:
        s3_key = f"{location}/{id}"
        response = s3.get_object(Bucket=BUCKET_NAME, Key=s3_key, ChecksumMode='DISABLED')
        db = get_sync_session()
        file = db.get(File_Table, id)
        curr_file = db.get(File_Table, f"{id}")
        ext = mimetypes.guess_extension(curr_file.content_type)
        if ext is None:
            ext = ""  # fallback if MIME type unknown
        else:
            ext = ext.lstrip(".")  # remove leading dot
        return StreamingResponse(
            response['Body'],
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={file.name}.{ext}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {e}")

@celery.task(name= "start_chunk_upload")
def upload_chunk1(file_id: str):
     return s3.create_multipart_upload(
            Bucket=BUCKET_NAME,
            Key=f"{MULTIPART_PREFIX}/{file_id}"
        )

@celery.task(name = "uploading_chunks")
def upload_chunk2(upload_id, file_id, chunk_num, chunk_bytes):
    return s3.upload_part(
        Bucket=BUCKET_NAME,
        Key=f"{MULTIPART_PREFIX}/{file_id}",
        PartNumber=chunk_num,
        UploadId=upload_id,
        Body=BytesIO(chunk_bytes)
    )
@celery.task(name = "stitch_chunk")
def stitch_chunk(file_id, upload_id, parts):
    s3.complete_multipart_upload(
        Bucket=BUCKET_NAME,
        Key=f"{MULTIPART_PREFIX}/{file_id}",
        UploadId=upload_id,
        MultipartUpload={"Parts": parts}
    )
    
    # Get file size from S3
    metadata = s3.head_object(Bucket=BUCKET_NAME, Key=f"{MULTIPART_PREFIX}/{file_id}")
    db = get_sync_session()
    job = db.get(Job, file_id)
    if job:
            job.status = JobStatus.finished
            db.commit()
    return metadata["ContentLength"] 

@celery.task(name="compress")
def compressTask(id, type_file, level, zip_flag, g_zip_flag, job_id, compress_id):
    key = f"upload/{id}"
    temp_file_path = None
    output_path = None

    try:
        # Step 1: Download from S3
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            response = s3.get_object(Bucket=BUCKET_NAME, Key=key, ChecksumMode='DISABLED')
            for chunk in response['Body'].iter_chunks(chunk_size=8192):
                if chunk:
                    temp_file.write(chunk)
            temp_file_path = temp_file.name

        # Step 2: Compression logic
        level_int = max(1, min(int(level), 100))
        bitrate_kbps = int(500 + (level_int / 100) * (4000 - 500))

        if type_file in ["video", "audio"]:
            ext = 'mp4' if type_file == 'video' else 'mp3'
            output_path = f"{temp_file_path}_compressed.{ext}"
            bitrate = f"{bitrate_kbps}k"
            stream = ffmpeg.input(temp_file_path)
            stream = stream.output(output_path, **({"b:v": bitrate} if type_file == "video" else {"b:a": bitrate}))
            ffmpeg.run(stream, overwrite_output=True)

        elif zip_flag:
            output_path = f"{temp_file_path}.zip"
            with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(temp_file_path, arcname=os.path.basename(temp_file_path))

        elif g_zip_flag:
            output_path = f"{temp_file_path}.gz"
            with open(temp_file_path, 'rb') as f_in, gzip.open(output_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)

        else:
            raise ValueError("Invalid compression parameters")

        # Step 3: Upload to S3
        if not output_path or not os.path.exists(output_path):
            raise FileNotFoundError("Output path does not exist")

        with open(output_path, "rb") as f:
            file_bytes = f.read()
        db = get_sync_session()
        buffer = BytesIO(file_bytes)
        buffer.seek(0)
        curr_file = db.get(File_Table, id)
        file_name = str(curr_file.name).rsplit(".", 1)[0]
        s3.upload_fileobj(buffer, BUCKET_NAME, f"compress/{compress_id}")
        file_table = File_Table(
            id=f"{compress_id}",
            name=file_name,
            size=len(file_bytes),
            content_type=ext,
        )
        db.add(file_table)
        db.commit()
        # Step 4: Update job status
        db = get_sync_session()
        job = db.get(Job, job_id)
        if job:
            job.status = JobStatus.finished
            db.commit()
        db.close()

    except Exception as e:
        print("------------------------------------------------------------")
        print("COMPRESSION FAILED")
        print("Error:", e)
        try:
            db = get_sync_session()
            job = db.get(Job, job_id)
            if job:
                job.status = JobStatus.failed
                db.commit()
            db.close()
        except:
            pass

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
    


@celery.task(name="convert")
def convertTask(file_id, file_type, to_type, job_id, converted_id,location):
    key = f"{location}/{file_id}"
    db = get_sync_session()
    job = db.get(Job, job_id)
    temp_file_path = None
    output_path = None
    file_type = file_type.replace('.', '').upper()
    to_type = to_type.replace('.', '').upper()
    image_options = ["BMP", "GIF", "ICO", "JPEG", "JPG", "PNG", "TGA", "TIFF", "WEBP"]
    print(file_id, file_type,to_type)
    VIDEO_CODECS = {
    "3GP": "libx264",      
    "AVI": "libx264",      
    "FLV": "flv",          
    "MKV": "libx264",     
    "MOV": "libx264",      
    "MP4": "libx264",      
    "OGV": "libtheora",    
    "WEBM": "libvpx",     
    "WMV": "wmv2"          
    }

    AUDIO_CODECS = {
    "3GP": "aac",
    "AVI": "aac",
    "FLV": "mp3",
    "MKV": "aac",
    "MOV": "aac",
    "MP4": "aac",
    "OGV": "libvorbis",
    "WEBM": "libvorbis",
    "WMV": "wmav2"
    }
    # Step 1: Download original file from S3
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            s3.download_fileobj(BUCKET_NAME, key, temp_file)
            temp_file_path = temp_file.name
    except Exception as e:
        print("Error downloading:", e)
        if job:
            job.status = JobStatus.failed
            db.commit()
        return False
    # Step 2: Convert file
    try:
        output_path = f"{temp_file_path}_converted.{to_type.lower()}"
        if file_type.upper() in image_options and to_type.upper() == "PDF":
            if not image_to_pdf(temp_file_path, output_path):
                job.status = JobStatus.failed
                db.commit()
                return False
        elif file_type.upper() == "PDF" and to_type.upper() in image_options:
            if not pdf_to_image(temp_file_path, output_path, to_type.upper()):
                job.status = JobStatus.failed
                db.commit()
                return False
        elif file_type.upper() in image_options:
            stream = ffmpeg.input(temp_file_path)
            stream = stream.output(output_path)  
            ffmpeg.run(stream, overwrite_output=True)
        elif file_type.upper() in VIDEO_CODECS:
            vcodec = VIDEO_CODECS[file_type.upper()]
            acodec = AUDIO_CODECS[file_type.upper()]
            stream = ffmpeg.input(temp_file_path)
            stream = stream.output(output_path, vcodec=vcodec, acodec=acodec)
            ffmpeg.run(stream, overwrite_output=True)
        else:
            job.status = JobStatus.failed
            db.commit()
            return False

        
    except Exception as e:
        print("Error converting:", e)
        if job:
            job.status = JobStatus.failed
            db.commit()
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        return False
    # Step 3: Upload converted file to S3
    try:
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise Exception("Converted file missing or empty.")

        with open(output_path, "rb") as f:
            file_bytes = f.read()

        buffer = BytesIO(file_bytes)
        buffer.seek(0)


        s3.upload_fileobj(buffer, BUCKET_NAME, f"{location}/{converted_id}")
        
        file_row = db.get(File_Table, converted_id)
        file_row.size = len(file_bytes)
        if job:
            print("CONVERT DONE")
            job.status = JobStatus.finished
        db.commit()

    except Exception as e:
        print("Error saving:", e)
        if job:
            job.status = JobStatus.failed
            db.commit()
            return False
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
        return True

def image_to_pdf(input_path, output_path):
    img = Image.open(input_path)
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.save(output_path, "PDF", resolution=300.0)
    return True


def pdf_to_image(input_path, output_path, image_format="PNG"):
    FORMAT_MAP = {
        "JPG": "JPEG",
        "JPEG": "JPEG",
        "PNG": "PNG",
        "WEBP": "WEBP",
        "TIFF": "TIFF",
    }
    image_format = FORMAT_MAP.get(image_format.upper())
    if not image_format:
        return False
    pages = convert_from_path(input_path, dpi=300)
    if not pages:
        return False
    pages[0].save(output_path, image_format)
    return True

def parse_time_list(times):
    result = []
    if ',' in times:
        split_times = times.split(',')
        for time in split_times:
            print(time)
            if time != '':
                result.append(float(time))
    else:
        result.append(float(times))
    return result

@celery.task(name="cut_video")
def cut_and_combine(file_id, start_times, end_times, job_id, cut_video_id, location):
    print("--------------------------------------------------------")
    print(start_times)
    print(end_times)
    print(file_id)
    print(location)
    db = get_sync_session()
    job = db.get(Job, job_id)
    segment_paths = []
    concat_list_path = None
    key = f"{location}/{file_id}"
    start_times = parse_time_list(start_times)
    end_times   = parse_time_list(end_times)
    print(start_times)
    print(end_times)
    try:
        # Download from S3
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            s3.download_fileobj(BUCKET_NAME, key, temp_file)
            video_path = temp_file.name

        output_path = f"{video_path}_cut.mp4"

        # Step 1: Cut each segment
        for i, (start, end) in enumerate(zip(start_times, end_times)):
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
            temp_file.close()
            segment_path = temp_file.name

            duration = end - start
            (
                ffmpeg
                .input(video_path, ss=start, t=duration)
                .output(segment_path, vcodec="libx264", acodec="aac")
                .run(quiet=True, overwrite_output=True)
            )

            segment_paths.append(segment_path)

        # Step 2: Create concat list file
        concat_list_path = tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".txt")
        for segment_path in segment_paths:
            concat_list_path.write(f"file '{segment_path}'\n")
        concat_list_path.close()

        # Step 3: Concatenate
        (
            ffmpeg
            .input(concat_list_path.name, format="concat", safe=0)
            .output(output_path, c="copy")
            .run(overwrite_output=True)
        )

        # Step 4: Upload to S3
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise Exception("Converted file missing or empty.")

        try:
            with open(output_path, "rb") as f:
                file_bytes = f.read()

            buffer = BytesIO(file_bytes)
            buffer.seek(0)
            s3.upload_fileobj(buffer, BUCKET_NAME, f"{location}/{cut_video_id}")
            print("UPLOAD COMPLETE")
        except Exception as e:
            print('UPLOAD FAILED')
        # Step 5: Save file record
        curr_file = db.get(File_Table, file_id)
        file_name = str(curr_file.name).rsplit(".", 1)[0] + '_cut'
        to_type = str(curr_file.content_type)
        file_table = File_Table(
            id=f"{cut_video_id}",
            name=file_name,
            size=len(file_bytes),
            content_type=to_type,
        )
        db.add(file_table)
        job.status = JobStatus.finished
        db.commit()

    except Exception as e:
        print("-------------------------------------------------------------------------")
        print("Cut/Combine FAILED:", e)
        job.status = JobStatus.failed
        db.commit()
        db.close()
        return False

    finally:
        # Cleanup temp files
        for segment_path in segment_paths:
            if os.path.exists(segment_path):
                os.remove(segment_path)
        if concat_list_path and os.path.exists(concat_list_path.name):
            os.remove(concat_list_path.name)
        if "output_path" in locals() and os.path.exists(output_path):
            os.remove(output_path)
        db.close()

    return True

def convert_time(time):
    if time[-1] == "s":
        return int(time[:-1])
    elif time[-1] == "m":
        return int(time[:-1]) * 60
    elif time[-1] == "h":
        return int(time[:-1]) * 3600
    return 0


def get_duration(file_id):
    key = f"upload/{file_id}"
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                s3.download_fileobj(BUCKET_NAME, key, temp_file)
                video_path = temp_file.name
                return video_path
    except Exception as e:
        print('error')


@celery.task(name="crop_video")
def crop_video(file_id, width, height, x, y, job_id, crop_id, location):
    key = f"{location}/{file_id}"
    db = get_sync_session()
    job = db.get(Job, job_id)
    try:
        file = db.get(File_Table, file_id)
        file_name = file.name
        if "." in file_name:
            file_name = file_name.split(".")[0]
        file_name = str(file.name).rsplit("_", 1)[0] + "_cropped"
        file_type = file.content_type
        

        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            s3.download_fileobj(BUCKET_NAME, key, temp_file)
            video_path = temp_file.name

        probe = ffmpeg.probe(video_path)
        video_stream = next(s for s in probe["streams"] if s["codec_type"] == "video")
        max_width, max_height = int(video_stream["width"]), int(video_stream["height"])
        print("000000000000000000000000000000000000000000000000")
        print(max_width,max_height)
        if x < 0 or y < 0 or width <= 0 or height <= 0 or x + width > max_width or y + height > max_height:
            raise ValueError("Incorrect crop input")

        output_path = f"{video_path}_cropped.mp4"
        (
            ffmpeg.input(video_path)
            .output(
                output_path,
                vf=f"crop={width}:{height}:{x}:{y}",
                vcodec="libx264",
                acodec="aac",
                strict="experimental"
            )
            .run(overwrite_output=True)
        )

        if not os.path.exists(output_path):
            raise FileNotFoundError("Cropped video missing after ffmpeg")

        with open(output_path, "rb") as f:
            file_bytes = f.read()

        buffer = BytesIO(file_bytes)
        buffer.seek(0)
        s3.upload_fileobj(buffer, BUCKET_NAME, f"{location}/{crop_id}")

        db.add(File_Table(
            id=crop_id,
            name=file_name,
            size=len(file_bytes),
            content_type=file_type
        ))

        job.status = JobStatus.finished
        db.commit()
        return "crop finished"

    except Exception as e:
        print("Crop failed:", e)
        job.status = JobStatus.failed
        db.commit()
        return f"crop failed: {e}"

    finally:
        if "output_path" in locals() and os.path.exists(output_path):
            os.remove(output_path)
        if "video_path" in locals() and os.path.exists(video_path):
            os.remove(video_path)
        db.close()

@celery.task(name = "overlay_image")
def overlay_image(file_id,job_id, image_id, overlay_id, file_name,file_type):
    key = f"upload/{file_id}"
    key2 = f"upload/{image_id}"
    db = get_sync_session()
    job = db.get(Job, job_id)
    if not file_name:
        file = db.get(File_Table, file_id)
        file_name = file.name + "_"
        file_type = file.content_type
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                s3.download_fileobj(BUCKET_NAME, key, temp_file)
                video_path = temp_file.name
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                s3.download_fileobj(BUCKET_NAME, key2, temp_file)
                image_path = temp_file.name
    except Exception as e:
        job.status = JobStatus.failed
        raise Exception("video does not exist")
    output_path = f"{video_path}_overlay.mp4"
    probe = ffmpeg.probe(video_path)
    duration = float(probe['format']['duration'])

    # Step 2: Prepare inputs
    video_input = ffmpeg.input(video_path)
    image_input = ffmpeg.input(image_path, loop=1, t=duration)  # loop image for full duration

    # Step 3: Resize image to match original video (optional)
    video_stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    video_width = int(video_stream['width'])
    video_height = int(video_stream['height'])
    image_scaled = image_input.filter('scale', video_width, video_height)

    # Step 4: Output image as video + audio
    ffmpeg.output(
        image_scaled,
        video_input.audio,
        output_path,
        vcodec='libx264',
        acodec='aac',
        shortest=None,  # output ends with the shortest stream (image or audio)
        pix_fmt='yuv420p'  # makes it playable in most players
    ).run(overwrite_output=True)
        
    try:
        if not os.path.exists(output_path):
            raise Exception("Converted file missing or empty.")

        with open(output_path, "rb") as f:
            file_bytes = f.read()

        buffer = BytesIO(file_bytes)
        buffer.seek(0)
        s3.upload_fileobj(buffer, BUCKET_NAME, f"overlay/{overlay_id}")
        db.add(File_Table(
            id=overlay_id,
            name=file_name + "_overlayed",
            size=len(file_bytes),
            content_type= file_type
            ))
    
    except Exception as e:
        job.status = JobStatus.failed
        raise HTTPException(status_code=500, detail=f"Error downloading file: {e}")
        
    if output_path and os.path.exists(output_path):
        os.remove(output_path)
        job.status = JobStatus.finished
        db.commit()
        return "overlay finished"


@celery.task(name="overlay_text")
def overlay_text(file_id, job_id, text, text_id, x_pos, y_pos, font_size, font, color, location):
    db = get_sync_session()
    job = db.get(Job, job_id)

    key = f"{location}/{file_id}"

    try:
        # Download video from S3
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:
            s3.download_fileobj(BUCKET_NAME, key, temp_file)
            video_path = temp_file.name
    except Exception as e:
        job.status = JobStatus.failed
        db.commit()
        raise Exception(f"video does not exist: {e}")

    # Output video path
    output_path = f"{video_path}_text.mp4"
    font_path = FONT_MAP.get(font, "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    try:
        # 1. Create a reference to the input file
        input_stream = ffmpeg.input(video_path)

        # 2. Separate the streams
        video = input_stream.video
        audio = input_stream.audio

        # 3. Apply the text filter ONLY to the video stream
        video = video.drawtext(
            text=text,
            fontfile=font_path,
            fontsize=font_size,
            fontcolor=color,
            x=x_pos,
            y=y_pos,
        )

        # 4. Combine Audio + Video in the output
        # Note: We pass BOTH 'audio' and 'video' to output()
        ffmpeg.output(
            audio,
            video, 
            output_path, 
            vcodec="libx264", 
            crf=18, 
            acodec="aac", # This will now actually encode the audio stream
            preset="medium",
            pix_fmt="yuv420p", 
            movflags="+faststart"
        ).run(overwrite_output=True)
    except Exception as e:
        job.status = JobStatus.failed
        db.commit()
        raise Exception(f"FFmpeg error: {e}")

    try:
        # Upload result to S3
        with open(output_path, "rb") as f:
            file_bytes = f.read()
        buffer = BytesIO(file_bytes)
        buffer.seek(0)
        s3.upload_fileobj(buffer, BUCKET_NAME, f"{location}/{text_id}")

        # Get original file and create new record
        original = db.get(File_Table, file_id)
        new_name = original.name.rsplit(".", 1)[0] + "_text.mp4"

        db.add(
            File_Table(
                id=text_id,
                name=new_name,
                size=len(file_bytes),
                content_type=original.content_type
            )
        )
    except Exception as e:
        job.status = JobStatus.failed
        db.commit()
        raise HTTPException(status_code=500, detail=f"Error uploading result: {e}")

    # CLEANUP
    if os.path.exists(video_path):
        os.remove(video_path)
    if os.path.exists(output_path):
        os.remove(output_path)

    job.status = JobStatus.finished
    db.commit()

    return "added text"


def removefileWorker(id, location):
    key = f"{location}/{id}"
    s3.delete_object(Bucket=BUCKET_NAME, Key=key)
    db = get_sync_session()
    file_record = db.get(File_Table, id)  # get the record by id
    if file_record:
        db.delete(file_record)            # mark it for deletion
        db.commit()    


@celery.on_after_configure.connect
def run_cleanup_on_start(sender, **kwargs):
    print("Celery started — running cleanup_old_files task")
    cleanup_old_files.delay()
    cleanup_old_jobs.delay()

@celery.task
def cleanup_old_files():
    cutoff = datetime.utcnow() - timedelta(days=1)
    with Session(engine) as session:
        stmt = select(File_Table).where(File_Table.created_on <= cutoff)
        files_to_delete = session.exec(stmt).all()
        for file_record in files_to_delete:
            try:
                # 3. Handle S3 deletion
                # S3 Keys are usually "folder/filename". 
                # If your key IS the file_id, you don't need to list everything first.
                # If you must search, it's better to target the specific ID.
                s3_key = f"uploads/{file_record.id}" # Adjust path to your NAS structure
                
                s3.delete_object(Bucket=BUCKET_NAME, Key=s3_key)
                print(f"Deleted {s3_key} from S3")
                # 5. Delete the file record
                session.delete(file_record)
                session.commit()
                print(f"Cleanup complete for ID: {file_record.id}")

            except Exception as e:
                session.rollback() # Important! Undo DB changes if S3 fails
                print(f"Error deleting {file_record.id}: {e}")
@celery.task
def cleanup_old_jobs():
    cutoff = datetime.utcnow() - timedelta(days=1)
    with Session(engine) as session:
        job_stmt = select(Job).where(Job.created_on <= cutoff )
        jobs = session.exec(job_stmt).all()
        for job in jobs:
            session.delete(job)
        session.commit()
        print(f"Job deleted {job.id}")

def get_table_worker(ids):
    with Session(engine) as session:
        stmt =  select(Job).where(Job.task_id.in_(ids) )
        results = session.exec(stmt).all()
        return [r.dict() for r in results]
    

def generateLink(file_id_list, link, password, expiration_string):
    try:
        db = get_sync_session()
        if (password !=""):
            password_bytes = password.encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_bytes, salt)
            hashed_password_str = hashed_password.decode('utf-8')
        else:
            hashed_password_str = ""
        # 3. Save to Database
        for fid in file_id_list:
            new_share = shareLink(
                link=link,
                file_id=fid,
                password=hashed_password_str,
                expiration=expiration_string, # Use the parsed date
                isactive=True
            )
            db.add(new_share)

        db.commit()
        db.close()

        return {
            "status": "success",
            "share_url": f"https://AAlwanCovert.net/share-file/s/{link}"
        }    
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}


def access_custom_link(custom_alias, input_password):
    try:
        response = getFileIDFromLinks(custom_alias)
        if not response:
            return "Error: Link not found."
        data = response[0]
        stored_hash = data.password.encode('utf-8')
        user_input = input_password.encode('utf-8')
        if not bcrypt.checkpw(user_input, stored_hash):
            return "Error: Incorrect password."
        return {"status": "authorized"}

    except ClientError as e:
        return str(e)
    

def getFileIDFromLinks(link):
    with Session(engine) as session:
        stmt =  select(shareLink).where(shareLink.link == link )
        results = session.exec(stmt).all()
        return results
    
def getFilesFromLink(link):
    target = getFileIDFromLinks(link)
    if not target:
        return []
    files_ids = [entry.file_id for entry in target]
    files = []
    with Session(engine) as session:
        stmt = select(File_Table).where(File_Table.id.in_(files_ids))
        results = session.exec(stmt).all()
        for file in results:
            files.append({
                "name": file.name,
                "size": file.size,
                "id": file.id,
                "type": file.content_type
            })
    return files

def checkifPassSet(link):
    result = getFileIDFromLinks(link)
    result = result[0]
    if result.password == "":
        return False
    return True
    


def checkLink(link):
    result = getFileIDFromLinks(link)
    if (result):
        return True
    else:
        return False
    
def checkLinkActive(link):
    result = getFileIDFromLinks(link)
    result = result[0]
    if (result.isactive == False):
        return "inactive link"
    elif datetime.now() > result.expiration:
        return "this link has expired."
    else:
        return True

def create_url_end(fileID):
    try:
        key = f"share/{fileID}"
        with Session(engine) as session:
            stmt =  select(shareLink).where(shareLink.file_id == fileID )
            results = session.exec(stmt).first()
        with Session(engine) as session:
            stmt =  select(File_Table).where(File_Table.id == fileID )
            fileresults = session.exec(stmt).first()
        filename =fileresults.name
        
        now = datetime.now()
        delta = results.expiration -now
        expires_in  = int(delta.total_seconds())
        if expires_in <= 0:
            return {"error": "Link has already expired"}
        response = s3.generate_presigned_url('get_object',
            Params={
                'Bucket': 'omniapi',
                'Key': key,
                "ResponseContentDisposition": f'attachment; filename="{filename}"'
            },
            ExpiresIn=expires_in
        )
        return {"url":response}
    except Exception as e:
        return {"error": str(e)}