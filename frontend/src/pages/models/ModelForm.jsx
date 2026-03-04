import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function ModelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    provider: 'openai',
    model_type: 'chat',
    api_endpoint: '',
    api_key: '',
    model_id: '',
    max_tokens: 4096,
    rate_limit_rpm: 60,
    rate_limit_tpm: 100000,
    health_check_enabled: true,
  });

  useEffect(() => {
    if (isEdit) {
      fetchModel();
    }
  }, [id]);

  const fetchModel = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/models/${id}`);
      setFormData(data);
    } catch (error) {
      toast.error(`加载模型失败：${error.message}`);
      navigate('/models');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/models/${id}`, formData);
        toast.success('模型已更新');
      } else {
        await api.post('/models', formData);
        toast.success('模型已创建');
      }
      navigate('/models');
    } catch (error) {
      toast.error(`保存失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const providers = [
    { value: 'openai', label: 'OpenAI', endpoint: 'https://api.openai.com/v1' },
    { value: 'anthropic', label: 'Anthropic', endpoint: 'https://api.anthropic.com/v1' },
    { value: 'azure', label: 'Azure OpenAI', endpoint: '' },
    { value: 'google', label: 'Google AI', endpoint: 'https://generativelanguage.googleapis.com/v1beta' },
    { value: 'cohere', label: 'Cohere', endpoint: 'https://api.cohere.com/v1' },
  ];

  const modelTypes = [
    { value: 'chat', label: '对话补全' },
    { value: 'completion', label: '文本补全' },
    { value: 'embedding', label: '嵌入' },
    { value: 'image', label: '图像生成' },
    { value: 'audio', label: '语音转写' },
  ];

  const updateEndpointFromProvider = (provider) => {
    const selected = providers.find(p => p.value === provider);
    if (selected?.endpoint && !formData.api_endpoint) {
      setFormData(prev => ({ ...prev, api_endpoint: selected.endpoint }));
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">正在加载模型数据...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/models" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEdit ? '编辑模型' : '添加模型'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? '修改模型配置' : '配置新的大语言模型'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                显示名称 *
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="input-field"
                placeholder="GPT-4 Turbo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                系统名称 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="gpt-4-turbo"
                required
                disabled={isEdit}
                pattern="^[a-z0-9_-]+$"
                title="仅允许小写字母、数字、连字符和下划线"
              />
              <p className="mt-1 text-xs text-gray-500">仅允许小写字母、数字、连字符、下划线</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">模型配置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                提供商 *
              </label>
              <select
                name="provider"
                value={formData.provider}
                onChange={(e) => {
                  handleChange(e);
                  updateEndpointFromProvider(e.target.value);
                }}
                className="input-field"
                required
              >
                {providers.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                模型类型 *
              </label>
              <select
                name="model_type"
                value={formData.model_type}
                onChange={handleChange}
                className="input-field"
                required
              >
                {modelTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                模型 ID *
              </label>
              <input
                type="text"
                name="model_id"
                value={formData.model_id}
                onChange={handleChange}
                className="input-field"
                placeholder="gpt-4-turbo-preview"
                required
              />
              <p className="mt-1 text-xs text-gray-500">提供商对应的模型标识</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API 地址 *
              </label>
              <input
                type="url"
                name="api_endpoint"
                value={formData.api_endpoint}
                onChange={handleChange}
                className="input-field"
                placeholder="https://api.openai.com/v1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key *
              </label>
              <input
                type="password"
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                className="input-field"
                placeholder="sk-..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">将加密存储于数据库</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最大 Token 数
              </label>
              <input
                type="number"
                name="max_tokens"
                value={formData.max_tokens}
                onChange={handleChange}
                className="input-field"
                min="1"
                max="1000000"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">限流与健康检查</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                每分钟请求数 (RPM)
              </label>
              <input
                type="number"
                name="rate_limit_rpm"
                value={formData.rate_limit_rpm}
                onChange={handleChange}
                className="input-field"
                min="1"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                每分钟 Token 数 (TPM)
              </label>
              <input
                type="number"
                name="rate_limit_tpm"
                value={formData.rate_limit_tpm}
                onChange={handleChange}
                className="input-field"
                min="1000"
                max="1000000"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="health_check_enabled"
                  checked={formData.health_check_enabled}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  启用健康检查
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <Link to="/models" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
            取消
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '保存中...' : '保存模型'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModelForm;