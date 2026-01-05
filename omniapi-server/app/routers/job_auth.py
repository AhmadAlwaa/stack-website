from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body, Form, Query
from sqlmodel import Session
from app.database import get_session
from app.functions import getJobStatus, handle_upload, handle_download, handle_upload_chunk, handle_upload_part, handle_stitch, handle_compress, handle_convert, handle_edit_video, check_crop, check_overlay, check_text
from app.worker import download_file, removefileWorker, get_table_worker, generateLink, getFilesFromLink, checkifPassSet, access_custom_link,checkLink, checkLinkActive,create_url_end
from datetime import datetime
from typing import List
from typing import Optional
router = APIRouter(
    prefix="/job",
    tags=["job"],
    responses={404: {"description": "Not found"}},
)

@router.get("/status/{job_id}")
def get_job_status(job_id: str, session: Session = Depends(get_session)):
    return getJobStatus(job_id, session)


@router.delete("/delete/{location}/{id}")
def removefile(location:str, id: str):
    return removefileWorker(id, location)

@router.post("/upload")
def upload(file: UploadFile = File(...),location: str = Form(...), session: Session = Depends(get_session)):
    print("DEBUG: /job/upload called - filename:", file.filename, "content_type:", file.content_type)
    return handle_upload(file, location,session)

@router.get("/download/{location}/{id}")
def download(id: str, location:str):
    return download_file(id, location)

@router.get("/upload/chunk")
def chunk_download(user_input: dict = Body(...), session: Session = Depends(get_session)):
    return handle_upload_chunk(user_input, session)

@router.post("/upload/chunk/{file_id}/{chunk_num}")
def upload_chunk_worker(file_id: str, chunk_num: int, chunk: UploadFile = File(...)):
    handle_upload_part(file_id, chunk_num, chunk)

@router.post("/stitch/{file_id}")
def stitch_s3_parts(file_id: str, session: Session = Depends(get_session)):
    handle_stitch(file_id, session)

@router.post("/compress")
def compress_file(id: str = Form(...),type_file: str = Form(...),level: int = Form(...),
    zip: bool = Form(...),g_zip: bool = Form(...),file: UploadFile = File(...), session: Session = Depends(get_session)
):
    return handle_compress(id, type_file, level, zip, g_zip, file, session)


@router.post("/convert")
def convert_file(id: str = Form(...), file_type: str = Form(...), to_type: str = Form(...),location: str = Form(...), task_id: str = Form(...), session: Session = Depends(get_session)):
    file = handle_convert(id,file_type,to_type,location,task_id, session)
    return file

@router.post("/edit/video")
def edit_video(file_id: str = Form(...), start_times: str = Form(...), end_times:str = Form(...),location: str = Form(...) ,session: Session = Depends(get_session), task_id: str = Form(...)):
    return handle_edit_video(file_id, start_times, end_times, location,session, task_id)

@router.post("/crop/video")
def crop_video(file_id: str = Form(...), 
               width: int = Form(...), 
               height: int = Form(...), 
               x: int = Form(...), 
               y: int = Form(...),
               location: str = Form(...),
               session: Session = Depends(get_session),
               task_id: str = Form(...)
               ):
    return check_crop(file_id,width, height, x, y,location,session, task_id)


@router.post("/overlay/image")
def overlay_image(file_id: str = Form(...),image_id: str = Form(...), image: UploadFile = File(...), file: UploadFile = File(...)
                  , session: Session = Depends(get_session),):
    return check_overlay(file_id, image_id, image, file,session)


@router.post("/overlay/text")
def overlay_text_route(
    file_id: str = Form(...),
    text: str = Form(...),
    x_pos: str = Form(...),
    y_pos: str = Form(...),
    font_size: int = Form(...),
    font: str = Form(...),
    color: str = Form(...),
    location: str = Form(...),
    session: Session = Depends(get_session),
    task_id: str = Form(...)
):
    return check_text(file_id, text, x_pos, y_pos, font_size, font, color, location, session, task_id)


@router.get("/item/file")
def get_table(ids: List[str] = Query(...)):
    return get_table_worker(ids)


@router.post("/generate-link")
def create_url(fileID:List[str] = Form(...), link:str = Form(...), password:str = Form(...), hours_valid: str = Form(...)):
    return generateLink(fileID,link,password, hours_valid)

@router.get("/checkPassword/{link}/{password}")
def checkPasswordEnd(link:str, password:str):
    return access_custom_link(link, password)

@router.get("/checkifPass/{link}")
def checkifPass(link:str):
    return checkifPassSet(link)

@router.get("/checkLink/{link}")
def checkifPass(link:str):
    return checkLink(link)

@router.get("/checkLinkActive/{link}")
def checkLinkActiveEnd(link:str):
    return checkLinkActive(link)

@router.get("/fileInfo/{link}")
def getFileInfoEnd(link:str):
    return getFilesFromLink(link)

@router.get("/generate-link/{file_id}")
def generate_link_end(file_id:str):
    return create_url_end(file_id)