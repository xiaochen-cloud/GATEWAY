/**
 * 统计文本中的代码行数（以 markdown 代码块内的行为主，也可统计整段文本中的代码样行）
 * @param {string} text - 模型返回的文本（通常含 markdown 代码块）
 * @returns {{ total: number, inBlocks: number, blocks: Array<{ lang?: string, lines: number }> }}
 */
export function countCodeLines(text) {
  if (!text || typeof text !== 'string') {
    return { total: 0, inBlocks: 0, blocks: [] };
  }

  const blocks = [];
  const fence = /^```(\w*)\s*$/;
  const lines = text.split(/\r?\n/);
  let inBlock = false;
  let currentLang = '';
  let currentCount = 0;
  let totalInBlocks = 0;

  for (const line of lines) {
    const match = line.match(fence);
    if (match) {
      if (inBlock) {
        blocks.push({ lang: currentLang || undefined, lines: currentCount });
        totalInBlocks += currentCount;
        currentCount = 0;
      } else {
        currentLang = match[1] || '';
      }
      inBlock = !inBlock;
      continue;
    }
    if (inBlock) {
      currentCount += 1;
    }
  }
  if (inBlock) {
    blocks.push({ lang: currentLang || undefined, lines: currentCount });
    totalInBlocks += currentCount;
  }

  // total: 所有非空行中“像代码”的行数（无 markdown 标题、列表等）或直接取代码块行数
  const total = totalInBlocks > 0 ? totalInBlocks : lines.filter((l) => l.trim().length > 0).length;

  return {
    total,
    inBlocks: totalInBlocks,
    blocks,
  };
}

export default countCodeLines;
