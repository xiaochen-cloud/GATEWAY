import httpx
import json
import time
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException
from sqlalchemy.orm import Session
import crud

class OpenAIAdapter:
    """OpenAI API 协议适配器"""
    
    def __init__(self, model_config: dict):
        self.base_url = model_config.get('api_endpoint', 'https://api.openai.com/v1')
        self.api_key = model_config.get('api_key')
        self.model_id = model_config.get('model_id')
        self.client = httpx.AsyncClient(
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            },
            timeout=30.0
        )
    
    async def forward_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """转发 OpenAI 兼容请求"""
        # 修改请求中的模型名称
        if 'model' in data:
            data['model'] = self.model_id
        
        endpoint = '/chat/completions'
        if 'messages' in data:
            endpoint = '/chat/completions'
        elif 'prompt' in data:
            endpoint = '/completions'
        elif 'input' in data:
            endpoint = '/embeddings'
        
        url = f"{self.base_url}{endpoint}"
        
        try:
            start_time = time.time()
            response = await self.client.post(url, json=data)
            response_time = int((time.time() - start_time) * 1000)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.text
                )
            
            result = response.json()
            
            # 提取 token 使用量
            usage = result.get('usage', {})
            prompt_tokens = usage.get('prompt_tokens', 0)
            completion_tokens = usage.get('completion_tokens', 0)
            total_tokens = usage.get('total_tokens', 0)
            
            return {
                'response': result,
                'prompt_tokens': prompt_tokens,
                'completion_tokens': completion_tokens,
                'total_tokens': total_tokens,
                'response_time_ms': response_time
            }
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Model request timeout")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

class AnthropicAdapter:
    """Anthropic Claude API 协议适配器"""
    
    def __init__(self, model_config: dict):
        self.base_url = model_config.get('api_endpoint', 'https://api.anthropic.com/v1')
        self.api_key = model_config.get('api_key')
        self.model_id = model_config.get('model_id')
        self.client = httpx.AsyncClient(
            headers={
                'x-api-key': self.api_key,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            timeout=30.0
        )
    
    async def forward_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """转发 Anthropic 兼容请求"""
        # 转换 OpenAI 格式到 Anthropic 格式
        anthropic_data = self._convert_openai_to_anthropic(data)
        
        url = f"{self.base_url}/messages"
        
        try:
            start_time = time.time()
            response = await self.client.post(url, json=anthropic_data)
            response_time = int((time.time() - start_time) * 1000)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.text
                )
            
            result = response.json()
            
            # 转换回 OpenAI 格式
            openai_response = self._convert_anthropic_to_openai(result)
            
            # Anthropic 不返回 token 计数，需要估算
            prompt_tokens = self._estimate_tokens(anthropic_data.get('messages', []))
            completion_tokens = self._estimate_tokens([result.get('content', [])])
            
            return {
                'response': openai_response,
                'prompt_tokens': prompt_tokens,
                'completion_tokens': completion_tokens,
                'total_tokens': prompt_tokens + completion_tokens,
                'response_time_ms': response_time
            }
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Model request timeout")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def _convert_openai_to_anthropic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """OpenAI → Anthropic 格式转换"""
        messages = data.get('messages', [])
        system_messages = [m['content'] for m in messages if m.get('role') == 'system']
        
        anthropic_messages = []
        for msg in messages:
            if msg['role'] == 'assistant':
                role = 'assistant'
            elif msg['role'] == 'user':
                role = 'user'
            elif msg['role'] == 'system':
                continue  # 系统消息单独处理
            else:
                role = 'user'
            
            anthropic_messages.append({
                'role': role,
                'content': msg['content']
            })
        
        result = {
            'model': self.model_id,
            'messages': anthropic_messages,
            'max_tokens': data.get('max_tokens', 4096),
            'temperature': data.get('temperature', 1.0),
            'stream': data.get('stream', False)
        }
        
        if system_messages:
            result['system'] = ' '.join(system_messages)
        
        return result
    
    def _convert_anthropic_to_openai(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Anthropic → OpenAI 格式转换"""
        content = data.get('content', [])
        if isinstance(content, list) and len(content) > 0:
            message_content = content[0].get('text', '')
        else:
            message_content = ''
        
        return {
            'id': data.get('id', ''),
            'object': 'chat.completion',
            'created': int(time.time()),
            'model': self.model_id,
            'choices': [{
                'index': 0,
                'message': {
                    'role': 'assistant',
                    'content': message_content
                },
                'finish_reason': data.get('stop_reason', 'stop')
            }],
            'usage': {
                'prompt_tokens': 0,  # 由外层估算
                'completion_tokens': 0,
                'total_tokens': 0
            }
        }
    
    def _estimate_tokens(self, texts: list) -> int:
        """简单估算 token 数量"""
        total = 0
        for item in texts:
            if isinstance(item, str):
                total += len(item) // 4
            elif isinstance(item, dict) and 'content' in item:
                total += len(str(item['content'])) // 4
        return total

class ModelRouter:
    """模型路由管理器"""
    
    def __init__(self, db: Session):
        self.db = db
        self.adapters = {}
    
    def get_adapter(self, model_id: int) -> Optional[Any]:
        """获取模型适配器（缓存）"""
        if model_id in self.adapters:
            return self.adapters[model_id]
        
        model = crud.get_model(self.db, model_id)
        if not model:
            return None
        
        provider = model.provider.lower()
        
        model_config = {
            'api_endpoint': model.api_endpoint,
            'api_key': model.api_key,
            'model_id': model.model_id
        }
        
        if provider == 'openai' or provider == 'azure':
            adapter = OpenAIAdapter(model_config)
        elif provider == 'anthropic':
            adapter = AnthropicAdapter(model_config)
        else:
            # 默认使用 OpenAI 适配器
            adapter = OpenAIAdapter(model_config)
        
        self.adapters[model_id] = adapter
        return adapter
    
    async def route_request(self, path: str, method: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """路由请求到目标模型"""
        # 查找匹配的路由
        routes = crud.get_routes(self.db, limit=100)
        
        matched_route = None
        for route in routes:
            if not route.enabled:
                continue
            
            # 简单路径匹配（支持通配符*）
            if self._match_path(route.path_pattern, path):
                if route.method == method or route.method == 'ANY':
                    matched_route = route
                    break
        
        if not matched_route:
            raise HTTPException(status_code=404, detail="No route found for path")
        
        # 选择目标模型（支持权重负载均衡）
        target_model_id = self._select_model(matched_route.id)
        if not target_model_id:
            raise HTTPException(status_code=503, detail="No available model for route")
        
        # 获取适配器
        adapter = self.get_adapter(target_model_id)
        if not adapter:
            raise HTTPException(status_code=500, detail="Model adapter not found")
        
        # 转发请求
        result = await adapter.forward_request(data)
        
        # 记录日志
        self._log_request(matched_route.id, target_model_id, path, method, result)
        
        return result['response']
    
    def _match_path(self, pattern: str, path: str) -> bool:
        """路径匹配"""
        if pattern == path:
            return True
        
        if '*' in pattern:
            pattern_parts = pattern.split('*')
            if len(pattern_parts) == 2:
                return path.startswith(pattern_parts[0]) and path.endswith(pattern_parts[1])
        
        return False
    
    def _select_model(self, route_id: int) -> Optional[int]:
        """基于权重的模型选择"""
        weights = crud.get_route_weights(self.db, route_id)
        
        if weights:
            # 基于权重的随机选择
            total_weight = sum(w.weight for w in weights)
            import random
            rand = random.randint(1, total_weight)
            
            current = 0
            for weight in weights:
                current += weight.weight
                if rand <= current:
                    model = crud.get_model(self.db, weight.model_id)
                    if model and model.status == 'active':
                        return model.id
        
        # 如果没有配置权重，使用默认模型
        route = crud.get_route(self.db, route_id)
        if route and route.target_model_id:
            model = crud.get_model(self.db, route.target_model_id)
            if model and model.status == 'active':
                return model.id
        
        return None
    
    def _log_request(self, route_id: int, model_id: int, path: str, method: str, result: Dict[str, Any]):
        """记录请求日志"""
        try:
            log_data = {
                'route_id': route_id,
                'model_id': model_id,
                'method': method,
                'path': path,
                'status_code': 200,
                'response_time_ms': result.get('response_time_ms', 0),
                'prompt_tokens': result.get('prompt_tokens', 0),
                'completion_tokens': result.get('completion_tokens', 0),
                'total_tokens': result.get('total_tokens', 0),
                'client_ip': '127.0.0.1',  # TODO: 从请求中获取
                'user_agent': 'llm-gateway'
            }
            crud.create_request_log(self.db, log_data)
        except Exception:
            # 日志记录失败不应影响主流程
            pass