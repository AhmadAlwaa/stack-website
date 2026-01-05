from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class File_Table(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    size: int
    content_type: str
    created_on: datetime = Field(default_factory=datetime.utcnow)