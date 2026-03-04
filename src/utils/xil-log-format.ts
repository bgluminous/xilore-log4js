import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const THREAD_WIDTH = 16;
const LOGGER_NAME_WIDTH = 32;
const TIMESTAMP_WIDTH = 23;
const LEVEL_WIDTH = 5;
const APP_NAME_WIDTH = 10;

export function padRight(s: string, width: number): string {
  const str = s ?? '';
  if (str.length >= width) {
    return str.slice(0, width);
  }
  return str + ' '.repeat(width - str.length);
}

export function leftPadUnderscore(s: string, width: number): string {
  const str = s ?? '';
  if (width <= 0) {
    return str;
  }
  if (str.length >= width) {
    return str.slice(0, width);
  }
  return ' '.repeat(width - str.length) + str;
}

export function formatThreadDisplay(
  threadName: string,
  compress: boolean
): string {
  let raw = threadName ?? '';
  if (raw.length <= THREAD_WIDTH) {
    return raw;
  }
  if (!compress) {
    return raw.slice(0, THREAD_WIDTH);
  }
  return '_' + raw.slice(-(THREAD_WIDTH - 1));
}

export function abbreviateLoggerName(loggerName: string, compress: boolean): string {
  const name = loggerName ?? '';
  if (!name || LOGGER_NAME_WIDTH <= 0) {
    return name;
  }
  if (!compress) {
    return name;
  }
  if (name.length <= LOGGER_NAME_WIDTH) {
    return name;
  }
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) {
    return truncateTail(name);
  }
  const packagePart = name.slice(0, lastDot);
  const classPart = name.slice(lastDot + 1);
  const segments = packagePart.split('.');
  let current = name;
  for (;;) {
    if (current.length <= LOGGER_NAME_WIDTH) {
      return current;
    }
    let firstLongIndex = -1;
    for (let j = 0; j < segments.length; j++) {
      if (segments[j]!.length > 1) {
        firstLongIndex = j;
        break;
      }
    }
    if (firstLongIndex < 0) {
      break;
    }
    segments[firstLongIndex] = segments[firstLongIndex]!.charAt(0);
    current = segments.join('.') + '.' + classPart;
  }
  return truncateTail(current);
}

function truncateTail(s: string): string {
  if (!s || s.length <= LOGGER_NAME_WIDTH) {
    return s ?? '';
  }
  return s.slice(-LOGGER_NAME_WIDTH);
}

/** 仅按“栈帧中的文件名”跳过库/Node 内部，不按路径跳过（避免用户代码在项目目录时被误判）。 */
const INTERNAL_STACK_PATTERNS = [
  'xil-log-runner.js',
  'xil-log-runner.ts',
  'xil-logger.js',
  'xil-logger.ts',
  'format.js',
  'xil-log-format.ts',
  'parse-detail.js',
  'xil-log-parse-detail.ts',
  'node:internal',
  'node:internal',
  'node:', // 所有 node: 内置模块
];

/**
 * 从当前调用栈解析出“调用方”的 file:line。
 * 不依赖 sourcemap 就能拿到 .js 行号（引擎在 Error 创建时就会记下）；
 * 若已安装 source-map-support 或使用 --enable-source-maps，会得到 .ts 行号。
 */
export function getCallSite(): string | null {
  try {
    ensureSourceMapSupport();
    const stack = new Error().stack;
    if (!stack) {
      return null;
    }
    const lines = stack.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('at ')) {
        continue;
      }
      const isInternal = INTERNAL_STACK_PATTERNS.some((p) => trimmed.includes(p));
      if (isInternal) {
        continue;
      }
      // 匹配文件名:行号（支持 file:///path/demo.ts:8:32 或 path\demo.js:7:31 等）
      const pathMatch = trimmed.match(/([^/\\]+\.(?:ts|js|mjs|cjs)):(\d+)/);
      if (pathMatch) {
        const [, file, lineNum] = pathMatch;
        return file && lineNum ? `${file}:${lineNum}` : null;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function formatBasicLog(
  level: string,
  timeStr: string,
  threadDisplay: string,
  appName: string,
  loggerName: string,
  message: string,
  stack: string | null,
  compressWidth: boolean,
  callSite?: string | null
): string {
  const timePad = padRight(timeStr ?? '', TIMESTAMP_WIDTH);
  const levelPad = padRight(level ?? '', LEVEL_WIDTH);
  const threadPad = leftPadUnderscore(threadDisplay ?? '', THREAD_WIDTH);
  // 类名（logger）保持原位置；有 callSite 时统一为 "loggerName (file:line)"
  const cs = callSite?.trim();
  const logger = loggerName ?? '';
  const sourceLabel = cs
    ? `${abbreviateLoggerName(logger, compressWidth)} (${cs})`
    : abbreviateLoggerName(logger, compressWidth);
  const loggerPad = leftPadUnderscore(sourceLabel, LOGGER_NAME_WIDTH);
  const parts: string[] = [
    timePad,
    ' [',
    levelPad,
    '] ',
  ];
  if (appName?.trim()) {
    parts.push('[', padRight(appName.trim(), APP_NAME_WIDTH), '] ');
  }
  parts.push('[', threadPad, '] ', loggerPad, ' ');
  if (message != null) {
    parts.push(message);
  }
  if (stack?.trim()) {
    parts.push('\n', stack);
  }
  return parts.join('');
}

let sourceMapSupportInstalled = false;
function ensureSourceMapSupport(): void {
  if (sourceMapSupportInstalled) {
    return;
  }
  sourceMapSupportInstalled = true;
  try {
    require('source-map-support').install();
  } catch {
    // optional dependency not installed
  }
}

export function throwableToStack(err: unknown): string | null {
  if (err == null) {
    return null;
  }
  if (err instanceof Error) {
    ensureSourceMapSupport();
    return (err.stack ?? err.message ?? String(err)).trim();
  }
  return String(err).trim();
}

export const WIDTHS = {
  TIMESTAMP_WIDTH,
  LEVEL_WIDTH,
  THREAD_WIDTH,
  APP_NAME_WIDTH,
  LOGGER_NAME_WIDTH,
} as const;
