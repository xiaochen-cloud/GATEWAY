"""
兼容层：从 repositories 重新导出，供 adapters 等旧代码使用。
新代码请直接使用 repositories 或 services。
"""
from repositories import (
    get_models,
    get_model,
    get_model_by_name,
    create_model,
    update_model,
    delete_model,
    update_model_health_status,
    get_routes,
    get_route,
    get_route_by_path,
    create_route,
    update_route,
    delete_route,
    get_route_weights,
    add_route_weight,
    update_route_weight,
    delete_route_weight,
    create_request_log,
)
