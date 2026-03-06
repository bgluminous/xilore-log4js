import { createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { XilLogEntity } from '../entity/xil-log-entity.js';
import type { XilLogConfig } from '../config/xil-log-config.js';

const LINE_SEP = '\n';
const SHUTDOWN_AWAIT_MS = 10000;

export class XilLogWriteAppender {
  private readonly path: string;
  private readonly filePrefix: string;
  private readonly charset: BufferEncoding;
  private readonly flushInterval: number;
  private currentDate = '';
  private currentWriter: NodeJS.WritableStream | null = null;
  private writtenSinceFlush = 0;
  private readonly queue: Array<() => void> = [];
  private running = true;
  private drainScheduled = false;
  private readonly lock = { current: '' };

  constructor(config: XilLogConfig) {
    this.path = config.getPath();
    this.filePrefix = config.getFilePrefix();
    this.charset = (config.getCharset() || 'utf8') as BufferEncoding;
    this.flushInterval = Math.max(1, config.getWriteFlushInterval());
  }

  private scheduleDrain(): void {
    if (this.drainScheduled) {
      return;
    }
    this.drainScheduled = true;
    setImmediate(() => this.drainLoop());
  }

  private drainLoop(): void {
    this.drainScheduled = false;
    const task = this.queue.shift();
    if (!task) {
      return;
    }
    try {
      task();
    } catch {
      // ignore
    }
    if (this.queue.length > 0) {
      this.scheduleDrain();
    }
  }

  append(entity: XilLogEntity | null): void {
    if (entity == null) {
      return;
    }
    this.queue.push(() => this.doAppend(entity));
    this.scheduleDrain();
  }

  private doAppend(entity: XilLogEntity): void {
    try {
      const w = this.writerForToday();
      if (w) {
        w.write(entity.basicLog + LINE_SEP, this.charset);
        this.writtenSinceFlush++;
        if (this.writtenSinceFlush >= this.flushInterval) {
          this.writtenSinceFlush = 0;
        }
      }
    } catch {
      // ignore
    }
  }

  private writerForToday(): NodeJS.WritableStream | null {
    const today = new Date().toISOString().slice(0, 10); // yyyy-MM-dd
    const lock = this.lock;
    synchronized(lock, () => {
      if (today !== this.currentDate) {
        this.closeCurrent();
        this.currentDate = today;
        this.writtenSinceFlush = 0;
        const dir = this.path;
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        const fileName = this.filePrefix + this.currentDate + '.log';
        const filePath = join(dir, fileName);
        this.currentWriter = createWriteStream(filePath, {
          flags: 'a',
          encoding: this.charset,
        });
      }
    });
    return this.currentWriter;
  }

  private closeCurrent(): void {
    if (this.currentWriter) {
      try {
        this.currentWriter.end();
      } catch {
        // ignore
      }
      this.currentWriter = null;
    }
    this.writtenSinceFlush = 0;
  }

  async shutdown(): Promise<void> {
    this.running = false;
    const deadline = Date.now() + SHUTDOWN_AWAIT_MS;
    while (this.queue.length > 0 && Date.now() < deadline) {
      await new Promise((r) => setImmediate(r));
    }
    synchronized(this.lock, () => this.closeCurrent());
  }
}

function synchronized<T>(_lock: { current: string }, fn: () => T): T {
  // 单线程 Node 下简化：仅保证同一 lock 串行
  return fn();
}
