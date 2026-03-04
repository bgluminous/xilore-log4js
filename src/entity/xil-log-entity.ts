import type { XilLogLevel } from '../xil-log-level.js';

/**
 * 单条日志实体，用于控制台格式化、写文件、上传 JSON。
 */
export interface XilLogEntity {
  level: XilLogLevel;
  message: string;
  timestamp: number;
  threadName: string;
  loggerName: string;
  appName: string;
  throwableStackTrace: string | null;
  containerId: string | null;
  basicLog: string;
  timestampIso: string;
}
