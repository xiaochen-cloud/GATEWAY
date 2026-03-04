from fastapi import FastAPI, Depends, HTTPException, Request, APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
import json
import asyncio
import time

from config import settings
from database import get_db
from repositories import get_models
from adapters import ModelRouter

# Initialize router
router = APIRouter()

# ============ OpenAI Compatible API ============
@router.post(f"{settings.API_V1_PREFIX}/forward{settings.API_V1_PREFIX}{{path:path}}")
async def forward_request(
    path: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Forward requests to models"""
    try:
        data = await request.json()
        method = request.method
        
        router = ModelRouter(db)
        response = await router.route_request(path, method, data)
        
        return JSONResponse(content=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Chat Completions ============
@router.post("/v1/chat/completions")
async def chat_completions(
    request: Request,
    db: Session = Depends(get_db)
):
    """OpenAI compatible chat completions"""
    try:
        data = await request.json()
        
        model_router = ModelRouter(db)
        response = await model_router.route_request(
            "/v1/chat/completions", 
            "POST", 
            data
        )
        
        # 支持流式响应
        if data.get('stream', False):
            # TODO: 实现流式响应
            pass
        
        return JSONResponse(content=response)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Completions ============
@router.post("/v1/completions")
async def completions(
    request: Request,
    db: Session = Depends(get_db)
):
    """OpenAI compatible text completions"""
    try:
        data = await request.json()
        
        model_router = ModelRouter(db)
        response = await model_router.route_request(
            "/v1/completions", 
            "POST", 
            data
        )
        
        return JSONResponse(content=response)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Embeddings ============
@router.post("/v1/embeddings")
async def embeddings(
    request: Request,
    db: Session = Depends(get_db)
):
    """OpenAI compatible embeddings"""
    try:
        data = await request.json()
        
        model_router = ModelRouter(db)
        response = await model_router.route_request(
            "/v1/embeddings", 
            "POST", 
            data
        )
        
        return JSONResponse(content=response)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ Models List ============
@router.get("/v1/models")
async def get_models_list(db: Session = Depends(get_db)):
    """OpenAI compatible models list"""
    try:
        models = get_models(db, limit=100)
        
        result = {
            "object": "list",
            "data": []
        }
        
        for model in models:
            if model.status == 'active':
                result["data"].append({
                    "id": model.name,
                    "object": "model",
                    "created": int(model.created_at.timestamp()),
                    "owned_by": model.provider,
                    "root": model.model_id,
                    "parent": None
                })
        
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ API Tokens Management ============
@router.post(f"{settings.API_V1_PREFIX}/api-tokens")
async def create_api_token(db: Session = Depends(get_db)):
    """Create API access token"""
    # TODO: 实现 API 令牌生成和验证
    return {
        "token": "sk-gateway-" + "".join(["abcdefghijklmnopqrstuvwxyz0123456789"[i % 36] for i in range(24)]),
        "created_at": int(time.time())
    }

# ============ Metrics ============
@router.get(f"{settings.API_V1_PREFIX}/metrics")
async def get_metrics(db: Session = Depends(get_db)):
    """Get system metrics"""
    try:
        # 获取模型统计
        models = get_models(db, limit=100)
        
        # 获取最近请求
        # TODO: 实现请求日志查询
        
        metrics = {
            "models": {
                "total": len(models),
                "active": len([m for m in models if m.status == 'active']),
                "inactive": len([m for m in models if m.status == 'inactive'])
            },
            "requests": {
                "total": 0,
                "today": 0,
                "success_rate": 100.0
            },
            "performance": {
                "avg_response_time": 0,
                "total_tokens": 0
            }
        }
        
        return JSONResponse(content=metrics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 公开的 metrics 端点
@router.get("/metrics")
async def public_metrics(db: Session = Depends(get_db)):
    """Public metrics endpoint"""
    return await get_metrics(db)

# ============ Health Check ============
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}