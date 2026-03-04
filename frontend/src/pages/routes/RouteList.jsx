import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await api.get('/routes');
      setRoutes(data);
    } catch (error) {
      toast.error(`加载路由列表失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除该路由吗？')) return;
    
    try {
      await api.delete(`/routes/${id}`);
      toast.success('路由已删除');
      fetchRoutes();
    } catch (error) {
      toast.error(`删除路由失败：${error.message}`);
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">正在加载路由列表...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">路由管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">配置请求如何转发到各模型</p>
        </div>
        <Link to="/routes/new" className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>添加路由</span>
        </Link>
      </div>

      {routes.length === 0 ? (
        <div className="card text-center py-12">
          <ArrowRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">暂无配置的路由</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">创建第一条路由以开始管理流量</p>
          <Link to="/routes/new" className="btn-primary inline-flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>添加路由</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div key={route.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getMethodColor(route.method)}`}>
                      {route.method}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {route.route_name}
                      </h3>
                      {!route.enabled && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          已禁用
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        <span className="font-medium text-gray-600 dark:text-gray-400">路径：</span>
                        <code className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                          {route.path_pattern}
                        </code>
                      </div>
                      {route.target_model_id && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">目标模型 ID：</span> {route.target_model_id}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        优先级：{route.priority}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/routes/edit/${route.id}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(route.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RouteList;