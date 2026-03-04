"""用户表 - 数据库访问层"""
from sqlalchemy.orm import Session
from typing import List, Optional

from models import UserDB
from schemas import UserCreate, UserUpdate


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[UserDB]:
    return db.query(UserDB).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int) -> Optional[UserDB]:
    return db.query(UserDB).filter(UserDB.id == user_id).first()


def get_user_by_account(db: Session, account: str) -> Optional[UserDB]:
    return db.query(UserDB).filter(UserDB.account == account).first()


def create_user(db: Session, user: UserCreate) -> UserDB:
    db_user = UserDB(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[UserDB]:
    db_user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not db_user:
        return None
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    db_user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True
