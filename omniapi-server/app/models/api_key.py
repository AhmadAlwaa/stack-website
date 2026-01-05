from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class APIKey(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="api_keys")