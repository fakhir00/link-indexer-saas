from datetime import datetime, timedelta
from typing import Optional
import uuid
import hashlib
import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.database import get_db
from app.models import User

security = HTTPBearer(auto_error=False)


def _password_bytes(password: str) -> bytes:
    return hashlib.sha256(password.encode("utf-8")).digest()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    hashed_bytes = hashed.encode("utf-8")
    try:
        if bcrypt.checkpw(_password_bytes(plain), hashed_bytes):
            return True
    except ValueError:
        return False

    # Backward compatibility for older non-prehashed bcrypt passwords.
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed_bytes)
    except ValueError:
        return False


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire, "iat": datetime.utcnow()}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
) -> User:
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    if not user:
        user = User(email="admin@example.com")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
