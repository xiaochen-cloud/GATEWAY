from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class ModelDB(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    provider = Column(String(50), nullable=False, index=True)
    model_type = Column(String(50), nullable=False)
    api_endpoint = Column(String(500), nullable=False)
    api_key = Column(Text, nullable=False)
    model_id = Column(String(255), nullable=False)
    status = Column(String(20), default="active", index=True)
    max_tokens = Column(Integer, default=4096)
    rate_limit_rpm = Column(Integer, default=60)
    rate_limit_tpm = Column(Integer, default=100000)
    health_check_enabled = Column(Boolean, default=True)
    last_health_check = Column(TIMESTAMP(timezone=True))
    health_status = Column(String(20), default="unknown")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    routes = relationship("RouteDB", back_populates="target_model")
    route_weights = relationship("RouteWeightDB", back_populates="model")

class RouteDB(Base):
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    path_pattern = Column(String(255), unique=True, index=True, nullable=False)
    route_name = Column(String(255), nullable=False)
    method = Column(String(10), default="POST")
    target_model_id = Column(Integer, ForeignKey("models.id"))
    priority = Column(Integer, default=100)
    enabled = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    target_model = relationship("ModelDB", back_populates="routes")
    weights = relationship("RouteWeightDB", back_populates="route", cascade="all, delete-orphan")

class RouteWeightDB(Base):
    __tablename__ = "route_weights"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    weight = Column(Integer, default=100)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    route = relationship("RouteDB", back_populates="weights")
    model = relationship("ModelDB", back_populates="route_weights")
    
    __table_args__ = (
        UniqueConstraint('route_id', 'model_id', name='_route_model_uc'),
    )

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    account = Column(String(64), unique=True, index=True, nullable=False)
    nickname = Column(String(128), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class RequestLogDB(Base):
    __tablename__ = "request_logs"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"))
    model_id = Column(Integer, ForeignKey("models.id"))
    request_id = Column(String(255), index=True)
    method = Column(String(10))
    path = Column(String(500))
    status_code = Column(Integer)
    response_time_ms = Column(Integer)
    prompt_tokens = Column(Integer)
    completion_tokens = Column(Integer)
    total_tokens = Column(Integer)
    error_message = Column(Text)
    client_ip = Column(String(50))
    user_agent = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    route = relationship("RouteDB")
    model = relationship("ModelDB")