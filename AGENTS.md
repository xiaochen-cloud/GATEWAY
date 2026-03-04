# AGENTS.md - LLM Gateway Repository Guide

## Cursor 提示词与代码行数记录（Hooks）

- **`.cursor/hooks.json`**：注册了 Cursor 可读取的 Hooks，与前端 `usePromptLogger` 行为一致。
  - **beforeSubmitPrompt**：用户发送提示词时，将提示词追加到 `memory/cursor-prompt-log.md`（脚本：`.cursor/hooks/log-prompt.js`）。
  - **afterAgentResponse**：助手回复完成后，统计回复中代码块行数并更新该条记录的「返回代码行数」（脚本：`.cursor/hooks/log-response.js`）。
- 日志文件：`memory/cursor-prompt-log.md`。需安装 Node.js，修改配置后重启 Cursor 生效。

## Build & Test Commands

### Backend (Python/FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
python -m pytest init_db_test.py -v  # Run single test
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run preview          # Preview production build
```

### Production
- Backend runs on port 8000
- Frontend runs on port 3000 with proxy to /api → localhost:8000
- API docs available at http://localhost:8000/api/v1/docs

## Code Style Guidelines

### Python (Backend)

**Imports**: Standard library first, third-party next, local modules last. Use explicit imports.
```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import crud
from database import get_db
```

**Type Hints**: Required for all function signatures and class attributes.
```python
def create_model(db: Session, model: ModelCreate) -> ModelDB:
    pass
```

**Naming**:
- Classes: PascalCase (ModelDB, RouteDB)
- Functions/variables: snake_case
- Constants: UPPER_CASE
- Private methods: _leading_underscore

**Error Handling**: Raise HTTPException for API errors with proper status codes.
```python
raise HTTPException(status_code=404, detail="Model not found")
```

**Database Models**: Use SQLAlchemy with declarative base. Include relationships and timestamps.
```python
created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
```

### React (Frontend)

**Imports**: React and hooks first, third-party libraries next, local components last.
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';
import Dashboard from './pages/Dashboard';
```

**Components**: Functional components with hooks. No class components.
```jsx
function ModelList() {
  const [models, setModels] = useState([]);
  return <div>...</div>;
}
export default ModelList;
```

**Styling**: Tailwind CSS for all styling. No inline styles unless dynamic.
```jsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
  Submit
</button>
```

**State Management**: Use React hooks (useState, useEffect). For complex state, use Context API or Zustand.

**Naming**:
- Components: PascalCase (ModelList, ModelForm)
- Functions: camelCase (handleClick, fetchData)
- Events: handle prefix (handleSubmit, onChange)
- Constants: UPPER_CASE

**Error Handling**: Use try-catch with toast notifications from react-hot-toast.
```jsx
try {
  await api.deleteModel(id);
  toast.success('Model deleted');
} catch (error) {
  toast.error('Failed to delete model');
}
```

## Project Structure

```
backend/
  main.py              # FastAPI app entry point
  config.py            # Settings & env vars
  database.py          # DB connection & session
  models.py            # SQLAlchemy models (ModelDB, RouteDB, etc.)
  schemas.py           # Pydantic schemas for validation
  crud.py              # Database operations
  adapters.py          # Protocol adapters (OpenAI, Anthropic)
  routers/             # API route modules
  requirements.txt     # Python dependencies

frontend/src/
  App.jsx              # Main app with routing
  main.jsx             # Entry point
  utils/api.js         # Axios API wrapper
  pages/               # Page components
    Dashboard.jsx
    models/            # Model management
    routes/            # Route management
```

## Key Patterns

**API Calls**: Use centralized API client in utils/api.js for consistent error handling.
**Routing**: React Router 6 with nested routes. Use useParams for dynamic segments.
**Forms**: Controlled components with value and onChange handlers.
**Environment**: Backend uses pydantic-settings. Frontend uses import.meta.env (via Vite).

## Notes

- Database defaults to PostgreSQL, configurable via DATABASE_URL
- CORS enabled for localhost:3000 by default
- API prefix: /api/v1
- OpenAI-compatible endpoints at /v1/* for external clients
