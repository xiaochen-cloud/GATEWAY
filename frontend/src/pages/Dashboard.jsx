import React, { useState, useEffect } from 'react';
import { Database, Route as RouteIcon, Activity, Clock, Zap } from 'lucide-react';
import api from '../utils/api';

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.get('/metrics');
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">正在加载指标...</div>
      </div>
    );
  }

  const cards = [
    {
      title: '模型总数',
      value: metrics?.models?.total || 0,
      icon: Database,
      color: 'bg-blue-500',
      subtitle: `活跃 ${metrics?.models?.active || 0} 个`
    },
    {
      title: '请求总数',
      value: metrics?.requests?.total || 0,
      icon: Activity,
      color: 'bg-green-500',
      subtitle: `今日 ${metrics?.requests?.today || 0}`
    },
    {
      title: '成功率',
      value: `${metrics?.requests?.success_rate || 100}%`,
      icon: Zap,
      color: 'bg-yellow-500',
      subtitle: '近24小时'
    },
    {
      title: '平均响应时间',
      value: `${metrics?.performance?.avg_response_time || 0}ms`,
      icon: Clock,
      color: 'bg-purple-500',
      subtitle: '近24小时'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">仪表盘</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">监控 LLM 网关运行状态</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            快捷操作
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/models'}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Database className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-800 dark:text-white">模型管理</div>
                <div className="text-sm text-gray-500">添加、编辑或配置大模型</div>
              </div>
            </button>
            <button
              onClick={() => window.location.href = '/routes'}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <RouteIcon className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-gray-800 dark:text-white">路由配置</div>
                <div className="text-sm text-gray-500">设置请求转发与路由规则</div>
              </div>
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            系统状态
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">API 服务</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                运行中
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">数据库</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                已连接
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">模型适配器</span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                就绪
              </span>
            </div>
            <div className="pt-4 border-t dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                网关版本：1.0.0<br />
                支持协议：OpenAI、Anthropic
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;