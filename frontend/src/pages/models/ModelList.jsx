import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Activity, Globe } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function ModelList() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await api.get('/models');
      setModels(data);
    } catch (error) {
      toast.error(`加载模型列表失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除该模型吗？')) return;
    
    try {
      await api.delete(`/models/${id}`);
      toast.success('模型已删除');
      fetchModels();
    } catch (error) {
      toast.error(`删除模型失败：${error.message}`);
    }
  };

  const handleHealthCheck = async (id) => {
    try {
      await api.post(`/models/${id}/health`);
      toast.success('健康检查已完成');
      fetchModels();
    } catch (error) {
      toast.error(`健康检查失败：${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">正在加载模型列表...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">模型管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">管理大语言模型及其配置</p>
        </div>
        <Link
          to="/models/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>添加模型</span>
        </Link>
      </div>

      {models.length === 0 ? (
        <div className="card text-center py-12">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">暂无配置的模型</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">添加第一个大模型以开始使用</p>
          <Link to="/models/new" className="btn-primary inline-flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>添加模型</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {models.map((model) => (
            <div key={model.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(model.status)}`}></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {model.display_name}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {model.provider}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">系统名：</span>
                        <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">{model.name}</code>
                      </div>
                      <div>
                        <span className="font-medium">模型 ID：</span> {model.model_id}
                      </div>
                      <div>
                        <span className="font-medium">类型：</span> {model.model_type}
                      </div>
                      <div>
                        <span className="font-medium">健康：</span>
                        <span className={`ml-2 ${getHealthColor(model.health_status)}`}>
                          {model.health_status || '未知'}
                        </span>
                        {model.last_health_check && (
                          <span className="ml-2 text-xs text-gray-500">
                            （上次检查：{new Date(model.last_health_check).toLocaleString('zh-CN')}）
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleHealthCheck(model.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="健康检查"
                  >
                    <Activity className="w-4 h-4 text-blue-600" />
                  </button>
                  <Link
                    to={`/models/edit/${model.id}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4 text-green-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t dark:border-gray-700 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">最大 Token 数</div>
                  <div className="font-medium">{model.max_tokens || '∞'}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">每分钟请求数 (RPM)</div>
                  <div className="font-medium">{model.rate_limit_rpm}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">每分钟 Token 数 (TPM)</div>
                  <div className="font-medium">{model.rate_limit_tpm}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ModelList;