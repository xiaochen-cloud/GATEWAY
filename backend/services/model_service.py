"""模型业务逻辑层"""
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException

from schemas import ModelCreate, ModelUpdate, ModelInDB
from repositories import (
    get_models as repo_get_models,
    get_model as repo_get_model,
    get_model_by_name,
    create_model as repo_create_model,
    update_model as repo_update_model,
    delete_model as repo_delete_model,
    update_model_health_status as repo_update_health,
)


class ModelService:
    """模型管理服务"""

    @staticmethod
    def list_models(db: Session, skip: int = 0, limit: int = 100) -> List[ModelInDB]:
        models = repo_get_models(db, skip=skip, limit=limit)
        return [ModelInDB.model_validate(m) for m in models]

    @staticmethod
    def get_model(db: Session, model_id: int) -> Optional[ModelInDB]:
        model = repo_get_model(db, model_id)
        return ModelInDB.model_validate(model) if model else None

    @staticmethod
    def create_model(db: Session, data: ModelCreate) -> ModelInDB:
        name = (data.name or "").strip().lower().replace(" ", "-")
        if not name:
            raise HTTPException(status_code=400, detail="模型系统名称不能为空")
        if get_model_by_name(db, name):
            raise HTTPException(status_code=400, detail=f"模型名称已存在: {name}")
        create_data = ModelCreate(
            **{**data.model_dump(), "name": name}
        )
        model = repo_create_model(db, create_data)
        return ModelInDB.model_validate(model)

    @staticmethod
    def update_model(db: Session, model_id: int, data: ModelUpdate) -> Optional[ModelInDB]:
        model = repo_update_model(db, model_id, data)
        return ModelInDB.model_validate(model) if model else None

    @staticmethod
    def delete_model(db: Session, model_id: int) -> bool:
        return repo_delete_model(db, model_id)

    @staticmethod
    def run_health_check(db: Session, model_id: int) -> Optional[ModelInDB]:
        model = repo_get_model(db, model_id)
        if not model:
            return None
        # 简单标记为已检查，实际可调用 adapters 做真实健康检查
        updated = repo_update_health(db, model_id, "healthy")
        return ModelInDB.model_validate(updated) if updated else None
