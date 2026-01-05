# models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import List
from pydantic import BaseModel
from app.models.api_key import APIKey
class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    userName: str = Field(index=True)
    password: str = Field(index=True)
    email: str = Field(index=True)
    api_keys: List[APIKey] = Relationship(back_populates="user")

class LoginRequest(BaseModel):
    userName: str
    password: str
