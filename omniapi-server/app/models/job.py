from sqlmodel import SQLModel, Field
from typing import List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class JobStatus(str, Enum):
    processing = "processing"
    finished = "finished"
    failed = "failed"

class Job(SQLModel, table=True):
    id: str = Field(primary_key = True)
    task_id: str = Field()
    status: JobStatus = Field()
    created_on: datetime = Field(default_factory=datetime.utcnow)
    updated_on: datetime = Field(default_factory=datetime.utcnow)
    operation: str = Field()

class Array(BaseModel):
    item: str    


