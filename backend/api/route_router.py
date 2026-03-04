"""路由管理 - API 层"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import RouteCreate, RouteUpdate, RouteInDB, RouteWeightCreate, RouteWeightInDB
from services.route_service import RouteService

router = APIRouter(prefix="/routes", tags=["路由管理"])


@router.get("", response_model=list[RouteInDB])
def list_routes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取路由列表"""
    return RouteService.list_routes(db, skip=skip, limit=limit)


@router.get("/{route_id}", response_model=RouteInDB)
def get_route(route_id: int, db: Session = Depends(get_db)):
    """获取单个路由"""
    route = RouteService.get_route(db, route_id)
    if not route:
        raise HTTPException(status_code=404, detail="路由不存在")
    return route


@router.post("", response_model=RouteInDB, status_code=201)
def create_route(data: RouteCreate, db: Session = Depends(get_db)):
    """创建路由"""
    try:
        return RouteService.create_route(db, data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{route_id}", response_model=RouteInDB)
def update_route(route_id: int, data: RouteUpdate, db: Session = Depends(get_db)):
    """更新路由"""
    route = RouteService.update_route(db, route_id, data)
    if not route:
        raise HTTPException(status_code=404, detail="路由不存在")
    return route


@router.delete("/{route_id}", status_code=204)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    """删除路由"""
    if not RouteService.delete_route(db, route_id):
        raise HTTPException(status_code=404, detail="路由不存在")


# 删除权重需放在 /{route_id} 之前，避免 /weights/1 被当作 route_id
@router.delete("/weights/{weight_id}", status_code=204)
def delete_weight(weight_id: int, db: Session = Depends(get_db)):
    """删除路由权重"""
    if not RouteService.delete_weight(db, weight_id):
        raise HTTPException(status_code=404, detail="权重记录不存在")


@router.get("/{route_id}/weights", response_model=list[RouteWeightInDB])
def list_weights(route_id: int, db: Session = Depends(get_db)):
    """获取路由权重列表"""
    return RouteService.get_weights(db, route_id)


@router.post("/{route_id}/weights", response_model=RouteWeightInDB, status_code=201)
def add_weight(route_id: int, data: RouteWeightCreate, db: Session = Depends(get_db)):
    """添加路由权重"""
    try:
        return RouteService.add_weight(db, route_id, data)
    except HTTPException:
        raise
