import { useState, useCallback, useEffect } from 'react';
import { countCodeLines } from '../utils/codeLineCount';

const STORAGE_KEY = 'llm_gateway_prompt_log';
const MAX_ENTRIES = 500;

/**
 * 从 localStorage 读取历史记录
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.slice(-MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

/**
 * 写入 localStorage
 */
function saveToStorage(entries) {
  try {
    const list = entries.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('usePromptLogger: save failed', e);
  }
}

/**
 * 将记录列表转为 Markdown 文本
 */
function toMarkdown(entries) {
  const lines = ['# 大模型网关 - 提示词与代码行数记录', '', `> 生成时间：${new Date().toLocaleString('zh-CN')}`, ''];

  entries.forEach((entry, i) => {
    const time = new Date(entry.timestamp).toLocaleString('zh-CN');
    lines.push(`## ${i + 1}. ${time}`);
    lines.push('');
    lines.push('### 提示词');
    lines.push('');
    lines.push('```');
    lines.push(entry.prompt.trim());
    lines.push('```');
    lines.push('');
    if (entry.codeLines != null) {
      lines.push(`**返回代码行数：** ${entry.codeLines}`);
      if (entry.codeBlocks && entry.codeBlocks.length > 0) {
        lines.push('');
        lines.push('代码块统计：');
        entry.codeBlocks.forEach((b) => {
          lines.push(`- \`${b.lang || 'text'}\`: ${b.lines} 行`);
        });
      }
      lines.push('');
    } else {
      lines.push('*（尚未返回或未统计）*');
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * 提示词与代码行数记录 Hook
 * - 每次提交提示词会追加一条记录并持久化到 localStorage，并更新可导出的 .md 内容
 * - 每次传入模型返回内容会统计代码行数并更新最近一条记录
 * - 支持导出为 .md 文件下载
 */
export function usePromptLogger() {
  const [entries, setEntries] = useState(loadFromStorage);

  // 初始化时从 localStorage 同步一次
  useEffect(() => {
    setEntries(loadFromStorage());
  }, []);

  /** 提交提示词时调用：追加一条记录并持久化 */
  const logPrompt = useCallback((prompt) => {
    const trimmed = typeof prompt === 'string' ? prompt.trim() : '';
    if (!trimmed) return;

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      timestamp: Date.now(),
      prompt: trimmed,
      codeLines: null,
      codeBlocks: null,
    };

    setEntries((prev) => {
      const next = [...prev, entry];
      saveToStorage(next);
      return next;
    });
  }, []);

  /** 模型返回数据时调用：统计代码行数并更新最近一条记录的代码行数 */
  const logResponse = useCallback((responseText) => {
    const text = typeof responseText === 'string' ? responseText : '';
    const { total, blocks } = countCodeLines(text);

    setEntries((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const last = next[next.length - 1];
      next[next.length - 1] = {
        ...last,
        codeLines: total,
        codeBlocks: blocks.length > 0 ? blocks : null,
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  /** 获取当前记录的 Markdown 全文（用于写入或展示） */
  const getMdContent = useCallback(() => toMarkdown(entries), [entries]);

  /** 下载为本地 .md 文件 */
  const downloadMd = useCallback(() => {
    const md = getMdContent();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `大模型网关-提示词记录-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getMdContent]);

  /** 清空记录（可选） */
  const clearLog = useCallback(() => {
    setEntries([]);
    saveToStorage([]);
  }, []);

  return {
    entries,
    logPrompt,
    logResponse,
    getMdContent,
    downloadMd,
    clearLog,
  };
}

export default usePromptLogger;
