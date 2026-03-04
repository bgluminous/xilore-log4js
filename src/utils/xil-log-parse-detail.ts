import type { XilLogLevelSwitch } from '../entity/xil-log-level-switch.js';
import { createLevelSwitch } from '../entity/xil-log-level-switch.js';

/**
 * 解析逗号分隔的输出名（print, write, upload），返回该级别的开关。
 */
export function parseLevelSwitch(value: string | null | undefined): XilLogLevelSwitch {
  if (value == null || value.trim() === '') {
    return createLevelSwitch(false, false, false);
  }
  const set = new Set(
    value
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  return createLevelSwitch(
    set.has('print'),
    set.has('write'),
    set.has('upload')
  );
}
