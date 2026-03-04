"""模型表 - 数据库访问层"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from models import ModelDB
from schemas import ModelCreate, ModelUpdate


def get_models(db: Session, skip: int = 0, limit: int = 100) -> List[ModelDB]:
    return db.query(ModelDB).offset(skip).limit(limit).all()


def get_model(db: Session, model_id: int) -> Optional[ModelDB]:
    return db.query(ModelDB).filter(ModelDB.id == model_id).first()


def get_model_by_name(db: Session, name: str) -> Optional[ModelDB]:
    return db.query(ModelDB).filter(ModelDB.name == name).first()


def create_model(db: Session, model: ModelCreate) -> ModelDB:
    db_model = ModelDB(**model.model_dump())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model


def update_model(db: Session, model_id: int, model_update: ModelUpdate) -> Optional[ModelDB]:
    db_model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not db_model:
        return None
    update_data = model_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_model, key, value)
    db.commit()
    db.refresh(db_model)
    return db_model


def delete_model(db: Session, model_id: int) -> bool:
    db_model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not db_model:
        return False
    db.delete(db_model)
    db.commit()
    return True


def update_model_health_status(db: Session, model_id: int, status: str) -> Optional[ModelDB]:
    db_model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not db_model:
        return None
    db_model.health_status = status
    db_model.last_health_check = datetime.utcnow()
    db.commit()
    db.refresh(db_model)
    return db_model
