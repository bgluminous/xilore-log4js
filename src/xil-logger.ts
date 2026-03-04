import type {XilLogLevel} from './xil-log-level.js';
import type {XilLogConfig} from './config/xil-log-config.js';
import {loadConfig} from './config/xil-log-config-loader.js';
import {XilLogRunner} from './xil-log-runner.js';

let runner: XilLogRunner | null = null;

function getRunner(): XilLogRunner {
  if (runner != null) {
    return runner;
  }
  const config = loadConfig();
  runner = new XilLogRunner(config);
  registerShutdownHook();
  return runner;
}

let shutdownRegistered = false;

function registerShutdownHook(): void {
  if (shutdownRegistered) {
    return;
  }
  shutdownRegistered = true;
  process.once('beforeExit', () => {
    shutdownIfPresent().then(_r => {
    });
  });
}

/**
 * 按名称获取 logger。
 */
export function getLogger(name: string): XilLogger;
/**
 * 按类/构造函数获取 logger，名称为类名或 name。
 */
export function getLogger(ctor: Function | { name?: string }): XilLogger;
export function getLogger(nameOrCtor: string | Function | { name?: string }): XilLogger {
  const name =
    typeof nameOrCtor === 'string'
      ? nameOrCtor
      : (nameOrCtor as { name?: string }).name ?? '';
  return new XilLogger(name ?? '');
}

/**
 * 关闭当前 runner，等待未完成的写文件/上传任务。
 */
export async function shutdownIfPresent(): Promise<void> {
  const r = runner;
  if (r) {
    runner = null;
    await r.shutdown();
  }
}

/**
 * 注入配置并替换当前 runner；用于测试或程序化配置。传入 null 则关闭当前 runner。
 */
export function setConfig(config: XilLogConfig | null): void {
  if (runner) {
    runner.shutdown().then(_r => {});
    runner = null;
  }
  if (config != null) {
    runner = new XilLogRunner(config);
  }
}

export class XilLogger {
  readonly name: string;

  constructor(name: string) {
    this.name = name ?? '';
  }

  private run(level: XilLogLevel, message: string, err?: unknown): void {
    const r = runner ?? getRunner();
    r.log(level, this.name, message, err);
  }

  trace(message: string): void;
  trace(message: string, err: unknown): void;
  trace(message: string, err?: unknown): void {
    this.run('TRACE', message, err);
  }

  debug(message: string): void;
  debug(message: string, err: unknown): void;
  debug(message: string, err?: unknown): void {
    this.run('DEBUG', message, err);
  }

  info(message: string): void;
  info(message: string, err: unknown): void;
  info(message: string, err?: unknown): void {
    this.run('INFO', message, err);
  }

  warn(message: string, err?: unknown): void {
    this.run('WARN', message, err);
  }

  error(message: string, err?: unknown): void {
    this.run('ERROR', message, err);
  }

  getName(): string {
    return this.name;
  }
}
