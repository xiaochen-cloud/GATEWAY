"""模型管理 - API 层"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import ModelCreate, ModelUpdate, ModelInDB
from services.model_service import ModelService

router = APIRouter(prefix="/models", tags=["模型管理"])


@router.get("", response_model=list[ModelInDB])
def list_models(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取模型列表"""
    return ModelService.list_models(db, skip=skip, limit=limit)


@router.get("/{model_id}", response_model=ModelInDB)
def get_model(model_id: int, db: Session = Depends(get_db)):
    """获取单个模型"""
    model = ModelService.get_model(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    return model


@router.post("", response_model=ModelInDB, status_code=201)
def create_model(data: ModelCreate, db: Session = Depends(get_db)):
    """创建模型"""
    try:
        return ModelService.create_model(db, data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{model_id}", response_model=ModelInDB)
def update_model(model_id: int, data: ModelUpdate, db: Session = Depends(get_db)):
    """更新模型"""
    model = ModelService.update_model(db, model_id, data)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    return model


@router.delete("/{model_id}", status_code=204)
def delete_model(model_id: int, db: Session = Depends(get_db)):
    """删除模型"""
    if not ModelService.delete_model(db, model_id):
        raise HTTPException(status_code=404, detail="模型不存在")


@router.post("/{model_id}/health", response_model=ModelInDB)
def health_check(model_id: int, db: Session = Depends(get_db)):
    """执行健康检查"""
    model = ModelService.run_health_check(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    return model
