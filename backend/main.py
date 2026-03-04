from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from sqlalchemy.orm import Session
import json
import asyncio
import time

from config import settings
from database import get_db, init_db
from routers.request_router import router as request_router
from api.model_router import router as model_router
from api.route_router import router as route_router
from api.user_router import router as user_router

# Initialize app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=None  # Disable default docs to enable our custom endpoint
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(request_router)
# 管理端 API：模型与路由 CRUD，统一前缀 /api/v1
app.include_router(model_router, prefix=settings.API_V1_PREFIX)
app.include_router(route_router, prefix=settings.API_V1_PREFIX)
app.include_router(user_router, prefix=settings.API_V1_PREFIX)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# ============ Custom Docs ============
@app.get(f"{settings.API_V1_PREFIX}/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    """Custom Swagger UI"""
    return get_swagger_ui_html(
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        title=settings.PROJECT_NAME,
        swagger_favicon_url="",
    )

# ============ Root ============
@app.get("/")
async def root():
    return {
        "message": "LLM Gateway API",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_PREFIX}/docs"
    }

# ============ Health Check ============
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ============ Database Initialization ============
@app.get(f"{settings.API_V1_PREFIX}/init-db", include_in_schema=False)
async def initialize_database():
    """Initialize database schema"""
    try:
        init_db()
        return {"message": "Database initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))