from fastapi import APIRouter, Depends,HTTPException, status
from app.models.user import User,LoginRequest
from passlib.context import CryptContext
from app.database import get_session
from app.dependencies import get_current_user, get_user_from_api_key
from uuid import uuid4
from sqlmodel import Session, select
from app.models.api_key import APIKey
from datetime import datetime, timedelta
from jose import JWTError, jwt


SECRET_KEY = "this_is_secret"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@router.post("/api_key")
def create_api(session: Session = Depends(get_session),
    current_user_payload: dict = Depends(get_current_user)):
    username = current_user_payload.userName
    if not username:
        raise HTTPException(status_code=401, detail="Invalid JWT payload")

    # Find user from JWT username
    user = session.exec(select(User).where(User.userName == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate and store API key
    api_key = APIKey(key=str(uuid4()), user_id=user.id)
    session.add(api_key)
    session.commit()
    session.refresh(api_key)
    return {"api_key": api_key.key}


@router.post("/register", response_model = User)
def create_user(user:User , session: Session = Depends(get_session)) -> User:
    user.password = pwd_context.hash(user.password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
@router.post("/login")
def login_user(data: LoginRequest, session: Session = Depends(get_session)):
    if "@" in data.userName:
        result = select(User).where(User.email == data.userName)
    else:
        result = select(User).where(User.userName == data.userName)

    user = session.exec(result).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    if not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail= "incorrect password")
     
    access_token = create_access_token(
        data={"username: ": user.userName},  
        expires_delta=timedelta(days=30)
    )
    return {"access_token": access_token,
            "user": user
    }

@router.get("")
def get_user_info(current_user: User = Depends(get_user_from_api_key)):
    return {
        "userName": current_user.userName,
        "email": current_user.email,
        "id": current_user.id
    }

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt