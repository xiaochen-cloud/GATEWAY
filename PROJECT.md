name: LLM Gateway
version: '1.0.0'
description: Large Language Model Gateway System

dependencies:
  python: ">=3.8"
  node: ">=16.0.0"

backend:
  path: ./backend
  runtime: python
  start: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
  path: ./frontend
  runtime: node
  start: npm start

database:
  type: postgresql
  version: ">=13"
  connection_env:
    DATABASE_URL: postgresql://user:password@localhost:5432/llm_gateway

external_ports:
  - 8000: Backend API
  - 3000: Frontend Dev Server