import type { XilLogLevel } from '../xil-log-level.js';

const CSI = '\u001B[';
export const RESET = CSI + '0m';
export const BOLD = CSI + '1m';
export const FG_RED = CSI + '31m';
export const FG_GREEN = CSI + '32m';
export const FG_YELLOW = CSI + '33m';
export const FG_BLUE = CSI + '34m';
export const FG_CYAN = CSI + '36m';

function prefixByLevel(level: XilLogLevel): string {
  switch (level) {
    case 'TRACE':
      return FG_CYAN;
    case 'DEBUG':
      return FG_BLUE;
    case 'INFO':
      return FG_GREEN;
    case 'WARN':
      return FG_YELLOW;
    case 'ERROR':
      return FG_RED + BOLD;
    default:
      return '';
  }
}

/** 按日志级别为文本加上 ANSI 颜色前缀与 RESET 后缀。 */
export function colorize(level: XilLogLevel, text: string): string {
  if (!level || text == null) {
    return text ?? '';
  }
  return prefixByLevel(level) + text + RESET;
}

/** 是否应禁用彩色（NO_COLOR、CI、TERM=dumb 等）。 */
export function isColorDisabledByEnv(): boolean {
  if (process.env.NO_COLOR != null) {
    return true;
  }
  if (process.env.TERM?.toLowerCase() === 'dumb') {
    return true;
  }
  if (process.env.CI === 'true') {
    return true;
  }
  return !!(
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.JENKINS_URL ||
    process.env.TEAMCITY_VERSION ||
    process.env.BUILDKITE ||
    process.env.TRAVIS
  );
}
