import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function RouteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState({
    path_pattern: '',
    route_name: '',
    method: 'POST',
    target_model_id: '',
    priority: 100,
    enabled: true,
  });
  const [weights, setWeights] = useState([]);

  useEffect(() => {
    fetchModels();
    if (isEdit) {
      fetchRoute();
    }
  }, [id]);

  const fetchModels = async () => {
    try {
      const data = await api.get('/models');
      setModels(data);
    } catch (error) {
      toast.error(`加载模型列表失败：${error.message}`);
    }
  };

  const fetchRoute = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/routes/${id}`);
      setFormData({
        path_pattern: data.path_pattern,
        route_name: data.route_name,
        method: data.method,
        target_model_id: data.target_model_id || '',
        priority: data.priority,
        enabled: data.enabled,
      });
      
      // Load weights
      const weightsData = await api.get(`/routes/${id}/weights`);
      setWeights(weightsData);
    } catch (error) {
      toast.error(`加载路由失败：${error.message}`);
      navigate('/routes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addWeight = () => {
    setWeights(prev => [...prev, { model_id: '', weight: 100 }]);
  };

  const removeWeight = (index) => {
    setWeights(prev => prev.filter((_, i) => i !== index));
  };

  const updateWeight = (index, field, value) => {
    setWeights(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        target_model_id: formData.target_model_id ? parseInt(formData.target_model_id) : null,
        priority: parseInt(formData.priority),
      };

      if (isEdit) {
        await api.put(`/routes/${id}`, payload);
        
        // Update weights
        // First delete existing weights
        const existingWeights = await api.get(`/routes/${id}/weights`);
        for (const w of existingWeights) {
          await api.delete(`/routes/weights/${w.id}`);
        }
        
        // Add new weights
        for (const weight of weights) {
          if (weight.model_id) {
            await api.post(`/routes/${id}/weights`, {
              model_id: parseInt(weight.model_id),
              weight: weight.weight,
            });
          }
        }
        
        toast.success('路由已更新');
      } else {
        await api.post('/routes', payload);
        toast.success('路由已创建');
      }
      navigate('/routes');
    } catch (error) {
      toast.error(`保存失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">正在加载路由数据...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/routes" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEdit ? '编辑路由' : '添加路由'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? '修改路由配置' : '配置新的转发规则'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">路由配置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                路由名称 *
              </label>
              <input
                type="text"
                name="route_name"
                value={formData.route_name}
                onChange={handleChange}
                className="input-field"
                placeholder="Chat Completions Route"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                路径匹配 *
              </label>
              <input
                type="text"
                name="path_pattern"
                value={formData.path_pattern}
                onChange={handleChange}
                className="input-field"
                placeholder="/v1/chat/completions"
                required
                disabled={isEdit}
              />
              <p className="mt-1 text-xs text-gray-500">支持通配符，如 /api/*</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HTTP 方法 *
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                className="input-field"
                required
              >
                {methods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                默认目标模型
              </label>
              <select
                name="target_model_id"
                value={formData.target_model_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">请选择模型</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.display_name} ({model.name})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">未配置权重时使用</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                优先级
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
                min="1"
                max="1000"
              />
              <p className="mt-1 text-xs text-gray-500">数值越大越优先匹配</p>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  启用路由
                </span>
              </label>
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">负载权重</h2>
              <button
                type="button"
                onClick={addWeight}
                className="btn-primary text-sm flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>添加权重</span>
              </button>
            </div>
            
            {weights.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                未配置权重。添加权重可在多个模型间分配流量。
              </p>
            ) : (
              <div className="space-y-3">
                {weights.map((weight, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <select
                      value={weight.model_id}
                      onChange={(e) => updateWeight(index, 'model_id', e.target.value)}
                      className="input-field flex-1"
                    >
                      <option value="">选择模型</option>
                      {models.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.display_name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={weight.weight}
                      onChange={(e) => updateWeight(index, 'weight', parseInt(e.target.value))}
                      className="input-field w-32"
                      min="1"
                      max="1000"
                      placeholder="权重"
                    />
                    <button
                      type="button"
                      onClick={() => removeWeight(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end space-x-3">
          <Link to="/routes" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
            取消
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '保存中...' : '保存路由'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default RouteForm;