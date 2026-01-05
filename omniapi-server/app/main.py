from typing import Union
from fastapi import FastAPI
from app.database import engine
from sqlmodel import SQLModel
from app.routers import user_auth, job_auth
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Then include routers
app.include_router(user_auth.router)
app.include_router(job_auth.router)
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.get("/")
def read_root():
    return {"Hello": "World"}
