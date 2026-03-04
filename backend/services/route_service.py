"""路由业务逻辑层"""
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException

from schemas import RouteCreate, RouteUpdate, RouteInDB, RouteWeightCreate, RouteWeightInDB
from repositories import (
    get_routes as repo_get_routes,
    get_route as repo_get_route,
    get_route_by_path,
    create_route as repo_create_route,
    update_route as repo_update_route,
    delete_route as repo_delete_route,
    get_route_weights as repo_get_weights,
    add_route_weight as repo_add_weight,
    delete_route_weight as repo_delete_weight,
)


class RouteService:
    """路由管理服务"""

    @staticmethod
    def list_routes(db: Session, skip: int = 0, limit: int = 100) -> List[RouteInDB]:
        routes = repo_get_routes(db, skip=skip, limit=limit)
        return [RouteInDB.model_validate(r) for r in routes]

    @staticmethod
    def get_route(db: Session, route_id: int) -> Optional[RouteInDB]:
        route = repo_get_route(db, route_id)
        return RouteInDB.model_validate(route) if route else None

    @staticmethod
    def create_route(db: Session, data: RouteCreate) -> RouteInDB:
        if get_route_by_path(db, data.path_pattern):
            raise HTTPException(status_code=400, detail=f"路径已存在: {data.path_pattern}")
        route = repo_create_route(db, data)
        return RouteInDB.model_validate(route)

    @staticmethod
    def update_route(db: Session, route_id: int, data: RouteUpdate) -> Optional[RouteInDB]:
        route = repo_update_route(db, route_id, data)
        return RouteInDB.model_validate(route) if route else None

    @staticmethod
    def delete_route(db: Session, route_id: int) -> bool:
        return repo_delete_route(db, route_id)

    @staticmethod
    def get_weights(db: Session, route_id: int) -> List[RouteWeightInDB]:
        weights = repo_get_weights(db, route_id)
        return [RouteWeightInDB.model_validate(w) for w in weights]

    @staticmethod
    def add_weight(db: Session, route_id: int, data: RouteWeightCreate) -> RouteWeightInDB:
        route = repo_get_route(db, route_id)
        if not route:
            raise HTTPException(status_code=404, detail="路由不存在")
        weight = repo_add_weight(db, route_id, data)
        return RouteWeightInDB.model_validate(weight)

    @staticmethod
    def delete_weight(db: Session, weight_id: int) -> bool:
        return repo_delete_weight(db, weight_id)
