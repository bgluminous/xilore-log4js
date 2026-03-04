import type { XilLogLevel } from '../xil-log-level.js';
import type { XilLogConfig } from './xil-log-config.js';
import type { XilLogExcludeItem } from '../entity/xil-log-exclude-item.js';
import { createExcludeItem } from '../entity/xil-log-exclude-item.js';
import { getContainerId } from '../utils/xil-log-container-id.js';
import { parseLevel } from '../xil-log-level.js';

const DEFAULT_CHARSET = 'UTF-8';
const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss.SSS';
const DEFAULT_PATH = '.';
const DEFAULT_FILE_PREFIX = 'app';
const DEFAULT_WRITE_FLUSH_INTERVAL = 1;

function isTrue(v: string | undefined): boolean {
  if (v == null || v.trim() === '') {
    return false;
  }
  const s = v.trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

/**
 * 基于扁平键值对的 XilLogConfig 实现。
 */
export class XilLogPropertiesConfig implements XilLogConfig {
  private readonly props: Map<string, string>;

  constructor(props: Record<string, string> | Map<string, string>) {
    this.props = props instanceof Map ? props : new Map(Object.entries(props ?? {}));
  }

  private get(key: string, defaultValue: string): string {
    const v = this.props.get(key);
    if (v != null && v.trim() !== '') {
      return v.trim();
    }
    return defaultValue;
  }

  getPath(): string {
    return this.get('path', DEFAULT_PATH);
  }

  getFilePrefix(): string {
    return this.get('file_prefix', DEFAULT_FILE_PREFIX);
  }

  getWriteFlushInterval(): number {
    let v = this.get('write.flush_interval', '');
    if (!v) {
      v = this.get('write.batch_size', String(DEFAULT_WRITE_FLUSH_INTERVAL));
    }
    if (!v) {
      return DEFAULT_WRITE_FLUSH_INTERVAL;
    }
    const n = parseInt(v, 10);
    return Number.isNaN(n) || n <= 0 ? DEFAULT_WRITE_FLUSH_INTERVAL : Math.min(n, 10000);
  }

  getDateFormat(): string {
    return this.get('date_format', DEFAULT_DATE_FORMAT);
  }

  getDetail(level: XilLogLevel): string {
    const base = `detail.${level.toLowerCase()}.`;
    const print = isTrue(this.get(base + 'print', 'true'));
    const write = isTrue(this.get(base + 'write', 'false'));
    const upload = isTrue(this.get(base + 'upload', 'false'));
    const parts: string[] = [];
    if (print) {
      parts.push('print');
    }
    if (write) {
      parts.push('write');
    }
    if (upload) {
      parts.push('upload');
    }
    return parts.join(',');
  }

  getUploadHost(): string {
    return this.get('upload.host', '');
  }

  getUploadToken(): string {
    return this.get('upload.token', '');
  }

  getCharset(): string {
    return this.get('charset', DEFAULT_CHARSET);
  }

  getContainerId(): string {
    return getContainerId();
  }

  getAppName(): string {
    return this.get('app_name', '');
  }

  isColorEnabled(): boolean {
    return this.get('color', 'true').toLowerCase() === 'true';
  }

  isCompressWidth(): boolean {
    return isTrue(this.get('compress_width', 'true'));
  }

  getLogExclude(): readonly XilLogExcludeItem[] {
    const list: XilLogExcludeItem[] = [];
    for (let i = 0; ; i++) {
      let pattern = this.get(`exclude.${i}.pattern`, '');
      if (!pattern) {
        pattern = this.get(`exclude.${i}`, '');
      }
      if (!pattern) {
        break;
      }
      const levels = this.parseExcludeLevels(i);
      list.push(createExcludeItem(pattern, levels));
    }
    return list;
  }

  private parseExcludeLevels(index: number): Set<XilLogLevel> | null {
    const base = `exclude.${index}.levels`;
    let single = this.get(base, '');
    if (single) {
      const set = parseLevelNames(single);
      if (set.size > 0) {
        return set;
      }
    }
    const parts: string[] = [];
    for (let j = 0; ; j++) {
      const v = this.get(`${base}.${j}`, '');
      if (!v) {
        break;
      }
      parts.push(v);
    }
    if (parts.length === 0) {
      return null;
    }
    return parseLevelNames(parts.join(','));
  }
}

function parseLevelNames(value: string): Set<XilLogLevel> {
  const set = new Set<XilLogLevel>();
  if (!value?.trim()) {
    return set;
  }
  for (const s of value.split(',')) {
    const name = s.trim();
    if (!name) {
      continue;
    }
    const level = parseLevel(name);
    if (level) {
      set.add(level);
    }
  }
  return set;
}
