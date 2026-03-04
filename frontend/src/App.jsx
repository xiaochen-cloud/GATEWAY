import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Settings, Database, Route as RouteIcon, BarChart3, MessageSquare, Users } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Playground from './pages/Playground';
import ModelList from './pages/models/ModelList';
import ModelForm from './pages/models/ModelForm';
import RouteList from './pages/routes/RouteList';
import RouteForm from './pages/routes/RouteForm';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: '仪表盘', href: '/', icon: BarChart3 },
    { name: '对话', href: '/playground', icon: MessageSquare },
    { name: '模型管理', href: '/models', icon: Database },
    { name: '路由管理', href: '/routes', icon: RouteIcon },
    { name: '用户管理', href: '/users', icon: Users },
    { name: '设置', href: '/settings', icon: Settings },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 min-w-[16rem] h-screen flex flex-col bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">大模型网关</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="sr-only">收起侧栏</span>
              <span className="text-gray-500 dark:text-gray-400">×</span>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className={`transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
            <div className="h-full px-6 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="sr-only">展开/收起侧栏</span>
                <span className="text-gray-500 dark:text-gray-400">☰</span>
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">网关 v1.0.0</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/models" element={<ModelList />} />
              <Route path="/models/new" element={<ModelForm />} />
              <Route path="/models/edit/:id" element={<ModelForm />} />
              <Route path="/routes" element={<RouteList />} />
              <Route path="/routes/new" element={<RouteForm />} />
              <Route path="/routes/edit/:id" element={<RouteForm />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/edit/:id" element={<UserForm />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;