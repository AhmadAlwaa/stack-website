from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select
from app.models.user import User
from app.models.api_key import APIKey
from app.database import get_session
from typing import Optional
SECRET_KEY = "this_is_secret"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username: ")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.exec(select(User).where(User.userName == username)).first()
    if user is None:
        raise credentials_exception

    return user

def get_user_from_api_key(
    x_api_key: Optional[str] = Header(None),
    session: Session = Depends(get_session)
) -> User:
    if not x_api_key:
        raise HTTPException(status_code=403, detail="Missing API key")

    result = select(APIKey).where(APIKey.key == x_api_key)
    api_key_obj = session.exec(result).first()
    if not api_key_obj:
        raise HTTPException(status_code=403, detail="Invalid API key")

    user = session.get(User, api_key_obj.user_id)
    return user