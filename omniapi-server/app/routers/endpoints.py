from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body, Form
from sqlmodel import Session
from app.database import get_session
from app.functions import getJobStatus, handle_upload, handle_download, handle_upload_chunk, handle_upload_part, handle_stitch, handle_compress, check_job_done, handle_convert
from app.worker import compress_result_download, convert_result_download
router = APIRouter(
    prefix="/job",
    tags=["job"],
    responses={404: {"description": "Not found"}},
)

@router.get("/status/{job_id}")
def get_job_status(job_id: str, session: Session = Depends(get_session)):
    return getJobStatus(job_id, session)

@router.post("/upload")
def upload(file: UploadFile = File(...), session: Session = Depends(get_session)):
    return {"job_id": handle_upload(file, session)}

@router.get("/download/{id}")
def download(id: str, session: Session = Depends(get_session)):
    return handle_download(id ,session)

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
    handle_compress(id, type_file, level, zip, g_zip, file, session)

@router.get("/compress/result/{id}")
def compress_result(id: str, session: Session = Depends(get_session)):
    if check_job_done(session, id):
        return compress_result_download(id)

@router.post("/convert")
def convert_file(id: str = Form(...), type: str = Form(...), to_type: str = Form(...), session: Session = Depends(get_session)):
     return handle_convert(id, type, to_type, session)

@router.get("/convert/result/{id}")
def convert_result(id: str):
    return convert_result_download(id)
