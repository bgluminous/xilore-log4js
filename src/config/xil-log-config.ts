import type { XilLogLevel } from '../xil-log-level.js';
import type { XilLogExcludeItem } from '../entity/xil-log-exclude-item.js';

/**
 * 配置接口：组件通过此接口获取配置值。
 */
export interface XilLogConfig {
  getPath(): string;
  getFilePrefix(): string;
  getWriteFlushInterval(): number;
  getDateFormat(): string;
  getDetail(level: XilLogLevel): string;
  getUploadHost(): string;
  getUploadToken(): string;
  getCharset(): string;
  getContainerId(): string;
  getAppName(): string;
  isColorEnabled(): boolean;
  isCompressWidth(): boolean;
  getLogExclude(): readonly XilLogExcludeItem[];
}
