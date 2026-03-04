import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getLogger,
  setConfig,
  shutdownIfPresent,
  XilLogger,
} from '../src/xil-logger.js';
import { XilLogPropertiesConfig } from '../src/config/xil-log-properties-config.js';

/** 关闭所有输出，仅用于测试 logger 不抛错 */
function silentConfig(): XilLogPropertiesConfig {
  const props = new Map<string, string>();
  props.set('detail.trace.print', 'false');
  props.set('detail.debug.print', 'false');
  props.set('detail.info.print', 'false');
  props.set('detail.warn.print', 'false');
  props.set('detail.error.print', 'false');
  props.set('detail.trace.write', 'false');
  props.set('detail.debug.write', 'false');
  props.set('detail.info.write', 'false');
  props.set('detail.warn.write', 'false');
  props.set('detail.error.write', 'false');
  return new XilLogPropertiesConfig(props);
}

describe('XilLogger', () => {
  beforeEach(() => {
    setConfig(silentConfig());
  });

  afterEach(async () => {
    setConfig(null);
    await shutdownIfPresent();
  });

  describe('getLogger', () => {
    it('按字符串名获取 logger', () => {
      const logger = getLogger('MyClass');
      expect(logger).toBeInstanceOf(XilLogger);
      expect(logger.getName()).toBe('MyClass');
    });
    it('按类/构造函数获取，名称为 name 属性', () => {
      class MyService {}
      const logger = getLogger(MyService);
      expect(logger.getName()).toBe('MyService');
    });
  });

  describe('log 方法', () => {
    it('trace debug info warn error 均可调用不抛错', () => {
      const log = getLogger('Test');
      log.trace('t');
      log.debug('d');
      log.info('i');
      log.warn('w');
      log.error('e');
    });
    it('可传 Error 作为第二参数', () => {
      const log = getLogger('Test');
      log.error('failed', new Error('test err'));
    });
  });

  describe('setConfig', () => {
    it('setConfig(null) 清空 runner', () => {
      setConfig(silentConfig());
      getLogger('A').info('x');
      setConfig(null);
      setConfig(silentConfig());
      getLogger('B').info('y');
    });
  });

  describe('shutdownIfPresent', () => {
    it('无 runner 时不抛错', async () => {
      setConfig(null);
      await expect(shutdownIfPresent()).resolves.toBeUndefined();
    });
  });
});
