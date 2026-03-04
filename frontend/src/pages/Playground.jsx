import React, { useState, useEffect } from 'react';
import { Download, Send, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { usePromptLogger } from '../hooks/usePromptLogger';
import toast from 'react-hot-toast';

/** 调用网关对话接口（OpenAI 兼容） */
async function chatWithGateway(model, messages, apiKey = 'sk-gateway') {
  const base = import.meta.env.VITE_GATEWAY_BASE_URL || '';
  const url = base ? `${base}/v1/chat/completions` : '/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2048,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText || '请求失败');
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  return content;
}

function Playground() {
  const [modelList, setModelList] = useState([]);
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const { entries, logPrompt, logResponse, downloadMd, clearLog } = usePromptLogger();

  useEffect(() => {
    api.get('/models').then((list) => {
      setModelList(Array.isArray(list) ? list : []);
      if (!model && list?.length > 0) setModel(String(list[0].name));
    }).catch(() => toast.error('获取模型列表失败'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text) {
      toast.error('请输入提示词');
      return;
    }
    if (!model) {
      toast.error('请先选择模型');
      return;
    }

    setLoading(true);
    setReply('');
    logPrompt(text);

    try {
      const content = await chatWithGateway(model, [{ role: 'user', content: text }]);
      setReply(content);
      logResponse(content);
      toast.success('返回已记录，代码行数已更新');
    } catch (err) {
      toast.error(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const lastCodeLines = entries.length > 0 ? entries[entries.length - 1].codeLines : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">对话</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            提交提示词会保存到本地记录，返回内容中的代码行数会自动统计并更新
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            共 {entries.length} 条记录
            {lastCodeLines != null && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                最近一次返回代码行数：{lastCodeLines}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={downloadMd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            <Download className="w-4 h-4" />
            导出 .md
          </button>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => { if (window.confirm('确定清空所有记录？')) clearLog(); }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              清空记录
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择模型
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">请选择模型</option>
            {modelList.map((m) => (
              <option key={m.id} value={m.name}>{m.display_name || m.name}</option>
            ))}
          </select>
        </div>

        <div className="card">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            提示词（提交后会保存到本地记录并参与 .md 导出）
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入你的提示词..."
            rows={4}
            className="input-field w-full resize-y"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-3 btn-primary inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? '发送中...' : '发送'}
          </button>
        </div>

        {reply && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              模型返回
            </h3>
            <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
              {reply}
            </pre>
            {entries.length > 0 && entries[entries.length - 1].codeLines != null && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                本段返回代码行数：<strong>{entries[entries.length - 1].codeLines}</strong>
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default Playground;
