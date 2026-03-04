"""请求日志表 - 数据库访问层"""
from sqlalchemy.orm import Session
from models import RequestLogDB


def create_request_log(db: Session, log_data: dict) -> RequestLogDB:
    db_log = RequestLogDB(**log_data)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
