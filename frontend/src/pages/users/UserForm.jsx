import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account: '',
    nickname: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/users/${id}`);
      setFormData({
        account: data.account || '',
        nickname: data.nickname || '',
        phone: data.phone || '',
        email: data.email || '',
      });
    } catch (error) {
      toast.error(`加载用户失败：${error.message}`);
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        account: formData.account.trim(),
        nickname: formData.nickname.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
      };
      if (isEdit) {
        await api.put(`/users/${id}`, {
          nickname: payload.nickname,
          phone: payload.phone,
          email: payload.email,
        });
        toast.success('用户已更新');
      } else {
        await api.post('/users', payload);
        toast.success('用户已创建');
      }
      navigate('/users');
    } catch (error) {
      toast.error(`保存失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">正在加载用户数据...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/users" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEdit ? '编辑用户' : '添加用户'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? '修改用户信息' : '填写账号、昵称、手机号、邮箱'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">账号 *</label>
              <input
                type="text"
                name="account"
                value={formData.account}
                onChange={handleChange}
                className="input-field"
                placeholder="登录账号"
                required
                disabled={isEdit}
              />
              {isEdit && <p className="mt-1 text-xs text-gray-500">账号不可修改</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">昵称 *</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="input-field"
                placeholder="显示昵称"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">手机号</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="13800138000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="user@example.com"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <Link to="/users" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
            取消
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '保存中...' : '保存用户'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;
