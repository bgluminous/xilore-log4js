/**
 * 日志级别，与常见日志 API 对应。
 */
export type XilLogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export const XilLogLevels: readonly XilLogLevel[] = [
  'TRACE',
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
] as const;

export function parseLevel(name: string): XilLogLevel | null {
  const u = name?.trim().toUpperCase();
  if (XilLogLevels.includes(u as XilLogLevel)) {
    return u as XilLogLevel;
  }
  return null;
}
