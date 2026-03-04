import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Users } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error(`加载用户列表失败：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除该用户吗？')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('用户已删除');
      fetchUsers();
    } catch (error) {
      toast.error(`删除用户失败：${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">正在加载用户列表...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">用户管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">管理账号、昵称、手机号、邮箱</p>
        </div>
        <Link to="/users/new" className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>添加用户</span>
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">暂无用户</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">添加第一个用户以开始使用</p>
          <Link to="/users/new" className="btn-primary inline-flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>添加用户</span>
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">账号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">昵称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">手机号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">邮箱</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.account}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.nickname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.phone || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.email || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link to={`/users/edit/${user.id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex text-green-600" title="编辑">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserList;
