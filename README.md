# LLM Gateway - 大模型网关系统

## 项目结构

```
llm-gateway/
├── backend/                 # Python FastAPI 后端
│   ├── main.py             # 主应用入口
│   ├── config.py           # 配置管理
│   ├── database.py         # 数据库连接
│   ├── models.py           # SQLAlchemy 模型
│   ├── schemas.py          # Pydantic 数据模型
│   ├── crud.py             # 数据库操作
│   ├── adapters.py         # 协议适配器
│   ├── requirements.txt    # Python 依赖
│   └── schema.sql          # 数据库建表脚本
│
├── frontend/               # React 前端
│   ├── src/
│   │   ├── App.jsx         # 主应用组件
│   │   ├── main.jsx        # 入口文件
│   │   ├── App.css         # 样式文件
│   │   ├── utils/
│   │   │   └── api.js      # API 封装
│   │   └── pages/
│   │       ├── Dashboard.jsx         # 监控面板
│   │       ├── models/
│   │       │   ├── ModelList.jsx     # 模型列表
│   │       │   └── ModelForm.jsx     # 模型表单
│   │       └── routes/
│   │           ├── RouteList.jsx     # 路由列表
│   │           └── RouteForm.jsx     # 路由表单
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── PROJECT.md              # 项目说明
```

## 快速启动

### 后端启动
```bash
cd llm-gateway/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端启动
```bash
cd llm-gateway/frontend
npm install
npm run dev
```

## 访问地址

- 前端界面: http://localhost:3000
- API 文档: http://localhost:8000/docs
- OpenAPI 规范: http://localhost:8000/api/v1/openapi.json

## 核心功能

### 1. 模型管理
- 支持多供应商: OpenAI, Anthropic, Azure, Google, Cohere
- 模型类型: Chat, Completion, Embedding, Image, Audio
- 健康检查和状态监控
- 速率限制配置

### 2. 路由管理
- 基于路径的路由规则
- 支持通配符匹配
- 权重负载均衡
- 故障转移机制

### 3. 协议转换
- OpenAI 协议兼容
- Anthropic 协议自动转换
- 统一的请求/响应格式

### 4. 监控面板
- 实时性能指标
- 请求统计
- 系统状态展示

## API 端点

### 模型管理
- `GET /api/v1/models` - 获取所有模型
- `POST /api/v1/models` - 创建新模型
- `PUT /api/v1/models/{id}` - 更新模型
- `DELETE /api/v1/models/{id}` - 删除模型
- `POST /api/v1/models/{id}/health` - 健康检查

### 路由管理
- `GET /api/v1/routes` - 获取所有路由
- `POST /api/v1/routes` - 创建新路由
- `PUT /api/v1/routes/{id}` - 更新路由
- `DELETE /api/v1/routes/{id}` - 删除路由

### OpenAI 兼容接口
- `POST /v1/chat/completions` - 聊天补全
- `POST /v1/completions` - 文本补全
- `POST /v1/embeddings` - 向量嵌入
- `GET /v1/models` - 模型列表

### 监控
- `GET /metrics` - 系统指标
- `GET /health` - 健康检查

## 数据库配置

默认使用 PostgreSQL，连接字符串在 `backend/.env` 中配置：

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/llm_gateway
```

## 环境变量

创建 `backend/.env` 文件：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/llm_gateway
SECRET_KEY=your-secret-key-change-in-production
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000"]
```

## 技术栈

### 后端
- Python 3.8+
- FastAPI (Web 框架)
- SQLAlchemy (ORM)
- PostgreSQL (数据库)
- httpx (HTTP 客户端)

### 前端
- React 18
- React Router 6
- Tailwind CSS
- Axios
- Lucide React (图标)

## 开发计划

- [ ] 流式响应支持
- [ ] API 密钥管理
- [ ] Redis 缓存层
- [ ] Grafana 监控集成
- [ ] 限流熔断机制
- [ ] 多租户支持

## 许可证

MIT License