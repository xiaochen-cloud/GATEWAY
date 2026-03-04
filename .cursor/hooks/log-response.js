#!/usr/bin/env node
/**
 * Cursor Hook: afterAgentResponse
 * 统计本条回复中的代码行数，并更新 memory/cursor-prompt-log.md 中最后一处的「（待更新）」。
 * 从 stdin 读取 JSON，包含 text（助手回复全文）。
 */
const fs = require('fs');
const path = require('path');

const PLACEHOLDER = '（待更新）';
const LOG_FILE = 'memory/cursor-prompt-log.md';

function countCodeLines(text) {
  if (!text || typeof text !== 'string') return 0;
  const fence = /^```(\w*)\s*$/;
  const lines = text.split(/\r?\n/);
  let inBlock = false;
  let currentCount = 0;
  let total = 0;
  for (const line of lines) {
    if (line.match(fence)) {
      if (inBlock) {
        total += currentCount;
        currentCount = 0;
      }
      inBlock = !inBlock;
      continue;
    }
    if (inBlock) currentCount += 1;
  }
  if (inBlock) total += currentCount;
  return total;
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const text = data.text || '';
      const codeLines = countCodeLines(text);
      const workspaceRoot = (data.workspace_roots && data.workspace_roots[0]) || process.cwd();
      const logPath = path.resolve(workspaceRoot, LOG_FILE);
      if (!fs.existsSync(logPath)) {
        process.exit(0);
        return;
      }
      let content = fs.readFileSync(logPath, 'utf8');
      const lastIndex = content.lastIndexOf(PLACEHOLDER);
      if (lastIndex !== -1) {
        content = content.slice(0, lastIndex) + String(codeLines) + content.slice(lastIndex + PLACEHOLDER.length);
        fs.writeFileSync(logPath, content, 'utf8');
      }
    } catch (e) {
      console.error('[log-response]', e.message);
    }
    process.exit(0);
  });
}

main();
