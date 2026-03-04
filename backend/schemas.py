from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl

class ModelBase(BaseModel):
    name: str
    display_name: str
    provider: str = Field(..., description="Model provider: openai, anthropic, azure, etc.")
    model_type: str = Field(..., description="Model type: chat, completion, embedding, etc.")
    api_endpoint: str
    api_key: str
    model_id: str
    max_tokens: Optional[int] = 4096
    rate_limit_rpm: Optional[int] = 60
    rate_limit_tpm: Optional[int] = 100000
    health_check_enabled: Optional[bool] = True

class ModelCreate(ModelBase):
    pass

class ModelUpdate(BaseModel):
    display_name: Optional[str] = None
    api_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    model_id: Optional[str] = None
    max_tokens: Optional[int] = None
    rate_limit_rpm: Optional[int] = None
    rate_limit_tpm: Optional[int] = None
    health_check_enabled: Optional[bool] = None
    status: Optional[str] = None

class ModelInDB(ModelBase):
    id: int
    status: str = "active"
    last_health_check: Optional[datetime] = None
    health_status: Optional[str] = "unknown"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RouteBase(BaseModel):
    path_pattern: str
    route_name: str
    method: str = "POST"
    priority: int = 100
    enabled: bool = True

class RouteCreate(RouteBase):
    target_model_id: Optional[int] = None

class RouteUpdate(BaseModel):
    path_pattern: Optional[str] = None
    route_name: Optional[str] = None
    method: Optional[str] = None
    priority: Optional[int] = None
    enabled: Optional[bool] = None
    target_model_id: Optional[int] = None

class RouteInDB(RouteBase):
    id: int
    target_model_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RouteWeightBase(BaseModel):
    model_id: int
    weight: int = 100

class RouteWeightCreate(RouteWeightBase):
    pass

class RouteWeightInDB(RouteWeightBase):
    id: int
    route_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ModelStats(BaseModel):
    total_requests: int = 0
    success_rate: float = 0.0
    avg_response_time: float = 0.0
    total_tokens: int = 0

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None


# 用户管理
class UserBase(BaseModel):
    account: str
    nickname: str
    phone: Optional[str] = None
    email: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class UserInDB(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True