"""路由与权重表 - 数据库访问层"""
from sqlalchemy.orm import Session
from typing import List, Optional

from models import RouteDB, RouteWeightDB
from schemas import RouteCreate, RouteUpdate, RouteWeightCreate


def get_routes(db: Session, skip: int = 0, limit: int = 100) -> List[RouteDB]:
    return db.query(RouteDB).order_by(RouteDB.priority).offset(skip).limit(limit).all()


def get_route(db: Session, route_id: int) -> Optional[RouteDB]:
    return db.query(RouteDB).filter(RouteDB.id == route_id).first()


def get_route_by_path(db: Session, path_pattern: str) -> Optional[RouteDB]:
    return db.query(RouteDB).filter(RouteDB.path_pattern == path_pattern).first()


def create_route(db: Session, route: RouteCreate) -> RouteDB:
    db_route = RouteDB(**route.model_dump())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route


def update_route(db: Session, route_id: int, route_update: RouteUpdate) -> Optional[RouteDB]:
    db_route = db.query(RouteDB).filter(RouteDB.id == route_id).first()
    if not db_route:
        return None
    update_data = route_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_route, key, value)
    db.commit()
    db.refresh(db_route)
    return db_route


def delete_route(db: Session, route_id: int) -> bool:
    db_route = db.query(RouteDB).filter(RouteDB.id == route_id).first()
    if not db_route:
        return False
    db.delete(db_route)
    db.commit()
    return True


def get_route_weights(db: Session, route_id: int) -> List[RouteWeightDB]:
    return db.query(RouteWeightDB).filter(RouteWeightDB.route_id == route_id).all()


def add_route_weight(db: Session, route_id: int, weight: RouteWeightCreate) -> RouteWeightDB:
    db_weight = RouteWeightDB(route_id=route_id, **weight.model_dump())
    db.add(db_weight)
    db.commit()
    db.refresh(db_weight)
    return db_weight


def update_route_weight(db: Session, weight_id: int, new_weight: int) -> Optional[RouteWeightDB]:
    db_weight = db.query(RouteWeightDB).filter(RouteWeightDB.id == weight_id).first()
    if not db_weight:
        return None
    db_weight.weight = new_weight
    db.commit()
    db.refresh(db_weight)
    return db_weight


def delete_route_weight(db: Session, weight_id: int) -> bool:
    db_weight = db.query(RouteWeightDB).filter(RouteWeightDB.id == weight_id).first()
    if not db_weight:
        return False
    db.delete(db_weight)
    db.commit()
    return True
