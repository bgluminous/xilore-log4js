import { createRequire } from 'node:module';
import type { XilLogLevel } from './xil-log-level.js';

const require = createRequire(import.meta.url);

/** Node 下用 main:pid 或 worker:threadId 作为线程显示。 */
function getThreadDisplayName(): string {
  if (typeof process === 'undefined') {
    return 'main';
  }
  try {
    const { threadId } = require('worker_threads');
    if (threadId > 0) {
      return `worker:${threadId}`;
    }
  } catch {
    // worker_threads 不可用
  }
  const pid = process.pid;
  return `main:${pid}`;
}
import type { XilLogConfig } from './config/xil-log-config.js';
import type { XilLogEntity } from './entity/xil-log-entity.js';
import type { XilLogExcludeItem } from './entity/xil-log-exclude-item.js';
import type { XilLogLevelSwitch } from './entity/xil-log-level-switch.js';
import { XilLogPrintAppender } from './appender/xil-log-print-appender.js';
import { XilLogWriteAppender } from './appender/xil-log-write-appender.js';
import { XilLogUploadAppender } from './appender/xil-log-upload-appender.js';
import { parseLevelSwitch } from './utils/xil-log-parse-detail.js';
import { formatBasicLog, formatThreadDisplay, getCallSite, throwableToStack } from './utils/xil-log-format.js';
import { formatDate } from './utils/xil-log-date-format.js';
import { XilLogLevels } from './xil-log-level.js';
import { appliesTo } from './entity/xil-log-exclude-item.js';

export class XilLogRunner {
  private readonly detailMap: Map<XilLogLevel, XilLogLevelSwitch>;
  private readonly excludeItems: readonly XilLogExcludeItem[];
  private readonly printAppender: XilLogPrintAppender;
  private readonly writeAppender: XilLogWriteAppender;
  private readonly uploadAppender: XilLogUploadAppender | null;
  private readonly dateFormat: string;
  private readonly compressWidth: boolean;
  private readonly cachedAppName: string;
  private readonly cachedContainerId: string;

  constructor(config: XilLogConfig) {
    if (config == null) {
      throw new Error('Config cannot be null');
    }
    const map = new Map<XilLogLevel, XilLogLevelSwitch>();
    for (const level of XilLogLevels) {
      map.set(level, parseLevelSwitch(config.getDetail(level)));
    }
    this.detailMap = map;
    this.excludeItems = config.getLogExclude() ?? [];
    this.printAppender = new XilLogPrintAppender(config);
    this.writeAppender = new XilLogWriteAppender(config);
    const host = config.getUploadHost()?.trim();
    this.uploadAppender =
      host ? new XilLogUploadAppender(config) : null;
    this.dateFormat = config.getDateFormat()?.trim() || 'yyyy-MM-dd HH:mm:ss.SSS';
    this.compressWidth = config.isCompressWidth();
    this.cachedAppName = config.getAppName()?.trim() ?? '';
    this.cachedContainerId = config.getContainerId()?.trim() ?? '';
  }

  private isExcluded(level: XilLogLevel, loggerName: string): boolean {
    if (!loggerName?.trim() || this.excludeItems.length === 0) {
      return false;
    }
    const name = loggerName.trim();
    for (const item of this.excludeItems) {
      if (!item?.pattern?.trim()) {
        continue;
      }
      if (!appliesTo(item, level)) {
        continue;
      }
      const pattern = item.pattern.trim();
      const match = pattern.endsWith('.')
        ? name.startsWith(pattern)
        : name === pattern || name.startsWith(pattern + '.');
      if (match) {
        return true;
      }
    }
    return false;
  }

  private shouldSkip(level: XilLogLevel): boolean {
    const sw = this.detailMap.get(level);
    if (!sw) {
      return true;
    }
    return !sw.print && !sw.write && !sw.upload;
  }

  log(
    level: XilLogLevel,
    loggerName: string,
    message: string,
    err?: unknown
  ): void {
    if (this.shouldSkip(level)) {
      return;
    }
    if (this.isExcluded(level, loggerName ?? '')) {
      return;
    }

    const ts = Date.now();
    const timeStr = formatDate(new Date(ts), this.dateFormat);
    const threadName = getThreadDisplayName();
    const threadDisplay = formatThreadDisplay(threadName, this.compressWidth);
    const stack = throwableToStack(err);
    const callSite = getCallSite();
    const displayLoggerName = loggerName ?? '';
    const basicLog = formatBasicLog(
      level,
      timeStr,
      threadDisplay,
      this.cachedAppName,
      displayLoggerName,
      message ?? '',
      stack,
      this.compressWidth,
      callSite
    );

    const timestampIso = new Date(ts).toISOString();
    const entity: XilLogEntity = {
      level,
      message: message ?? '',
      timestamp: ts,
      threadName,
      loggerName: loggerName ?? '',
      appName: this.cachedAppName,
      throwableStackTrace: stack,
      containerId: this.cachedContainerId || null,
      basicLog,
      timestampIso,
    };

    const sw = this.detailMap.get(level);
    if (!sw) {
      return;
    }
    if (sw.print) {
      this.printAppender.append(entity);
    }
    if (sw.write) {
      this.writeAppender.append(entity);
    }
    if (sw.upload && this.uploadAppender) {
      this.uploadAppender.append(entity);
    }
  }

  async shutdown(): Promise<void> {
    await this.writeAppender.shutdown();
    await this.uploadAppender?.shutdown();
  }
}
