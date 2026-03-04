import type { XilLogLevel } from '../xil-log-level.js';

/**
 * 单条日志排除项：包/类匹配模式 + 对该项生效的日志级别集合。
 * levels 为空或 null 表示该排除项对所有级别生效。
 */
export interface XilLogExcludeItem {
  pattern: string;
  levels: Set<XilLogLevel> | null;
}

export function appliesTo(item: XilLogExcludeItem, level: XilLogLevel): boolean {
  if (!item?.pattern?.trim()) {
    return false;
  }
  return item.levels == null || item.levels.size === 0 || item.levels.has(level);
}

export function createExcludeItem(
  pattern: string,
  levels: Set<XilLogLevel> | null
): XilLogExcludeItem {
  return {
    pattern: pattern != null ? pattern.trim() : '',
    levels:
      levels == null || levels.size === 0 ? null : new Set(levels),
  };
}
