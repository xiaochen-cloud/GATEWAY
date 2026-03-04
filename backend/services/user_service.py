"""用户业务逻辑层"""
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException

from schemas import UserCreate, UserUpdate, UserInDB
from repositories import (
    get_users as repo_get_users,
    get_user as repo_get_user,
    get_user_by_account,
    create_user as repo_create_user,
    update_user as repo_update_user,
    delete_user as repo_delete_user,
)


class UserService:
    """用户管理服务"""

    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 100) -> List[UserInDB]:
        users = repo_get_users(db, skip=skip, limit=limit)
        return [UserInDB.model_validate(u) for u in users]

    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[UserInDB]:
        user = repo_get_user(db, user_id)
        return UserInDB.model_validate(user) if user else None

    @staticmethod
    def create_user(db: Session, data: UserCreate) -> UserInDB:
        account = (data.account or "").strip()
        if not account:
            raise HTTPException(status_code=400, detail="账号不能为空")
        if get_user_by_account(db, account):
            raise HTTPException(status_code=400, detail=f"账号已存在: {account}")
        nickname = (data.nickname or "").strip()
        if not nickname:
            raise HTTPException(status_code=400, detail="昵称不能为空")
        user = repo_create_user(db, data)
        return UserInDB.model_validate(user)

    @staticmethod
    def update_user(db: Session, user_id: int, data: UserUpdate) -> Optional[UserInDB]:
        user = repo_update_user(db, user_id, data)
        return UserInDB.model_validate(user) if user else None

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        return repo_delete_user(db, user_id)
