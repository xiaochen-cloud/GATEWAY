"""用户管理 - API 层"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import UserCreate, UserUpdate, UserInDB
from services.user_service import UserService

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("", response_model=list[UserInDB])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取用户列表"""
    return UserService.list_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserInDB)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """获取单个用户"""
    user = UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.post("", response_model=UserInDB, status_code=201)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    """创建用户"""
    try:
        return UserService.create_user(db, data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{user_id}", response_model=UserInDB)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    """更新用户"""
    user = UserService.update_user(db, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """删除用户"""
    if not UserService.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="用户不存在")
