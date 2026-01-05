from sqlmodel import SQLModel, Field
from typing import List
from datetime import datetime
from enum import Enum

class shareLink(SQLModel, table=True):
    file_id: str = Field(primary_key = True)
    link: str = Field()
    password: str = Field()
    expiration: datetime = Field(default_factory=datetime.utcnow)
    isactive: bool = Field(default_factory=True)