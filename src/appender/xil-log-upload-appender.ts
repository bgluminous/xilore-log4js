import {request as httpsRequest} from 'node:https';
import {request as httpRequest} from 'node:http';
import type {XilLogEntity} from '../entity/xil-log-entity.js';
import type {XilLogConfig} from '../config/xil-log-config.js';

function escapeJson(s: string): string {
  if (s == null) {
    return '';
  }
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function toJson(entity: XilLogEntity): string {
  const parts = [
    `"level":"${escapeJson(entity.level)}"`,
    `"message":"${escapeJson(entity.message)}"`,
    `"timestamp":${entity.timestamp}`,
    `"timestampIso":"${escapeJson(entity.timestampIso)}"`,
    `"threadName":"${escapeJson(entity.threadName)}"`,
    `"loggerName":"${escapeJson(entity.loggerName)}"`,
    `"appName":"${escapeJson(entity.appName)}"`,
    `"containerId":"${escapeJson(entity.containerId ?? '')}"`,
    `"basicLog":"${escapeJson(entity.basicLog)}"`,
  ];
  if (entity.throwableStackTrace?.trim()) {
    parts.push(`"throwableStackTrace":"${escapeJson(entity.throwableStackTrace)}"`);
  }
  return '{' + parts.join(',') + '}';
}

export class XilLogUploadAppender {
  private readonly uploadHost: string;
  private readonly uploadToken: string;
  private readonly queue: Array<XilLogEntity> = [];
  private running = true;
  private drainScheduled = false;

  constructor(config: XilLogConfig) {
    this.uploadHost = config.getUploadHost()?.trim() ?? '';
    this.uploadToken = config.getUploadToken()?.trim() ?? '';
  }

  private scheduleDrain(): void {
    if (this.drainScheduled) {
      return;
    }
    this.drainScheduled = true;
    setImmediate(() => {
      void this.drainLoop();
    });
  }

  private async drainLoop(): Promise<void> {
    this.drainScheduled = false;
    const entity = this.queue.shift();
    if (!entity) {
      return;
    }
    await this.doUpload(entity);
    if (this.queue.length > 0) {
      this.scheduleDrain();
    }
  }

  append(entity: XilLogEntity | null): void {
    if (entity == null || !this.uploadHost) {
      return;
    }
    this.queue.push(entity);
    this.scheduleDrain();
  }

  private async doUpload(entity: XilLogEntity): Promise<void> {
    const path = this.uploadHost.endsWith('/')
      ? this.uploadHost + 'receive'
      : this.uploadHost + '/receive';
    const urlStr = this.uploadToken ? `${path}?token=${encodeURIComponent(this.uploadToken)}` : path;
    try {
      const url = new URL(urlStr);
      const request = url.protocol === 'https:' ? httpsRequest : httpRequest;
      const body = toJson(entity);
      await new Promise<void>((resolve, reject) => {
        const req = request(
          url,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Content-Length': Buffer.byteLength(body, 'utf8') },
          },
          (res) => {
            res.on('data', () => {});
            res.on('end', () => resolve());
            res.on('error', reject);
          }
        );
        req.on('error', reject);
        req.write(body, 'utf8');
        req.end();
      });
    } catch {
      // ignore
    }
  }

  async shutdown(): Promise<void> {
    this.running = false;
    const deadline = Date.now() + 5000;
    while (this.queue.length > 0 && Date.now() < deadline) {
      await new Promise((r) => setImmediate(r));
    }
  }
}
