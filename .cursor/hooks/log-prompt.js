#!/usr/bin/env node
/**
 * Cursor Hook: beforeSubmitPrompt
 * 将用户提示词追加到 memory/cursor-prompt-log.md，与 usePromptLogger 行为一致。
 * 从 stdin 读取 JSON，包含 prompt、conversation_id、workspace_roots 等。
 */
const fs = require('fs');
const path = require('path');

const PLACEHOLDER = '（待更新）';
const LOG_FILE = 'memory/cursor-prompt-log.md';

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const prompt = (data.prompt || '').trim();
      if (!prompt) {
        process.stdout.write(JSON.stringify({ continue: true }) + '\n');
        process.exit(0);
        return;
      }
      const workspaceRoot = (data.workspace_roots && data.workspace_roots[0]) || process.cwd();
      const logPath = path.resolve(workspaceRoot, LOG_FILE);
      const dir = path.dirname(logPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const now = new Date();
      const timeStr = now.toISOString().slice(0, 19).replace('T', ' ');
      let content = '';
      if (!fs.existsSync(logPath)) {
        content = `# Cursor 提示词与代码行数记录\n\n与前端 usePromptLogger Hook 行为一致。\n\n---\n\n`;
      }
      content += `## ${timeStr}\n\n### 提示词\n\n\`\`\`\n${prompt}\n\`\`\`\n\n### 返回代码行数\n\n${PLACEHOLDER}\n\n---\n\n`;
      fs.appendFileSync(logPath, content, 'utf8');
      process.stdout.write(JSON.stringify({ continue: true }) + '\n');
    } catch (e) {
      console.error('[log-prompt]', e.message);
      process.stdout.write(JSON.stringify({ continue: true }) + '\n');
    }
    process.exit(0);
  });
}

main();
