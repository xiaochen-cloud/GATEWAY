-- 模型管理表
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'azure', etc.
    model_type VARCHAR(50) NOT NULL, -- 'chat', 'completion', 'embedding', etc.
    api_endpoint VARCHAR(500) NOT NULL,
    api_key TEXT NOT NULL,
    model_id VARCHAR(255) NOT NULL, -- e.g., 'gpt-4', 'claude-3-opus'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'error'
    max_tokens INTEGER DEFAULT 4096,
    rate_limit_rpm INTEGER DEFAULT 60,
    rate_limit_tpm INTEGER DEFAULT 100000,
    health_check_enabled BOOLEAN DEFAULT true,
    last_health_check TIMESTAMP,
    health_status VARCHAR(20) DEFAULT 'unknown', -- 'healthy', 'unhealthy', 'unknown'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 路由管理表
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    path_pattern VARCHAR(255) NOT NULL UNIQUE,
    route_name VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'POST',
    target_model_id INTEGER REFERENCES models(id),
    priority INTEGER DEFAULT 100,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 路由负载均衡权重表
CREATE TABLE route_weights (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
    weight INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_id, model_id)
);

-- 请求日志表
CREATE TABLE request_logs (
    id BIGSERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id),
    model_id INTEGER REFERENCES models(id),
    request_id VARCHAR(255),
    method VARCHAR(10),
    path VARCHAR(500),
    status_code INTEGER,
    response_time_ms INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    error_message TEXT,
    client_ip VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_models_provider ON models(provider);
CREATE INDEX idx_models_status ON models(status);
CREATE INDEX idx_routes_enabled ON routes(enabled);
CREATE INDEX idx_request_logs_created_at ON request_logs(created_at);
CREATE INDEX idx_request_logs_model_id ON request_logs(model_id);

-- 更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
