@echo off
echo ========================================
echo LLM Gateway - 大模型网关系统
echo ========================================
echo.
echo 正在启动后端服务...
echo 后端地址: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo.
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000