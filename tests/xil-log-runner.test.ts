import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setConfig, getLogger, shutdownIfPresent } from '../src/xil-logger.js';
import { XilLogPropertiesConfig } from '../src/config/xil-log-properties-config.js';
function configWithPrintOnly(): XilLogPropertiesConfig {
  const props = new Map<string, string>();
  props.set('detail.info.print', 'true');
  props.set('detail.info.write', 'false');
  props.set('detail.info.upload', 'false');
  return new XilLogPropertiesConfig(props);
}

function configWithExclude(): XilLogPropertiesConfig {
  const props = new Map<string, string>();
  props.set('detail.info.print', 'true');
  props.set('detail.info.write', 'false');
  props.set('exclude.0.pattern', 'tests.XilLogRunner');
  props.set('exclude.0.levels', 'INFO');
  return new XilLogPropertiesConfig(props);
}

describe('XilLogRunner', () => {
  beforeEach(() => {
    setConfig(configWithPrintOnly());
  });

  afterEach(async () => {
    setConfig(null);
    await shutdownIfPresent();
  });

  it('接受配置并记录日志', () => {
    const log = getLogger('XilLogRunner.test');
    let received = '';
    const write = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: any) => {
      received += chunk;
      return true;
    };
    try {
      log.info('runner test message');
      // 异步 append，等一帧
      return new Promise<void>((resolve) => {
        setImmediate(() => {
          expect(received).toContain('runner test message');
          expect(received).toContain('INFO');
          resolve();
        });
      });
    } finally {
      process.stdout.write = write;
    }
  });

  it('排除项生效时该 logger 该级别不输出', () => {
    setConfig(configWithExclude());
    const log = getLogger('tests.XilLogRunner');
    let received = '';
    const write = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: any) => {
      received += chunk;
      return true;
    };
    try {
      log.info('should be excluded');
      return new Promise<void>((resolve) => {
        setImmediate(() => {
          expect(received).not.toContain('should be excluded');
          resolve();
        });
      });
    } finally {
      process.stdout.write = write;
    }
  });
});
