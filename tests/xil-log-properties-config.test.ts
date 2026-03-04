import { describe, it, expect } from 'vitest';
import { XilLogPropertiesConfig } from '../src/config/xil-log-properties-config.js';

describe('XilLogPropertiesConfig', () => {
  it('从 Map 读取 path、filePrefix、charset', () => {
    const props = new Map([
      ['path', '/var/log'],
      ['file_prefix', 'app'],
      ['charset', 'utf8'],
    ]);
    const config = new XilLogPropertiesConfig(props);
    expect(config.getPath()).toBe('/var/log');
    expect(config.getFilePrefix()).toBe('app');
    expect(config.getCharset()).toBe('utf8');
  });
  it('缺省使用默认值', () => {
    const config = new XilLogPropertiesConfig(new Map());
    expect(config.getPath()).toBe('.');
    expect(config.getFilePrefix()).toBe('app');
    expect(config.getDateFormat()).toBe('yyyy-MM-dd HH:mm:ss.SSS');
  });
  it('getWriteFlushInterval 解析数字', () => {
    const config = new XilLogPropertiesConfig(
      new Map([['write.flush_interval', '100']])
    );
    expect(config.getWriteFlushInterval()).toBe(100);
  });
  it('getDetail 根据 level 返回 print,write,upload 组合', () => {
    const config = new XilLogPropertiesConfig(
      new Map([
        ['detail.info.print', 'true'],
        ['detail.info.write', 'true'],
        ['detail.info.upload', 'false'],
      ])
    );
    const detail = config.getDetail('INFO');
    expect(detail).toContain('print');
    expect(detail).toContain('write');
  });
  it('getUploadHost、getUploadToken', () => {
    const config = new XilLogPropertiesConfig(
      new Map([
        ['upload.host', 'https://log.example.com'],
        ['upload.token', 'secret'],
      ])
    );
    expect(config.getUploadHost()).toBe('https://log.example.com');
    expect(config.getUploadToken()).toBe('secret');
  });
  it('getLogExclude 解析 exclude.0.pattern 与 levels', () => {
    const config = new XilLogPropertiesConfig(
      new Map([
        ['exclude.0.pattern', 'com.noise'],
        ['exclude.0.levels', 'DEBUG'],
      ])
    );
    const list = config.getLogExclude();
    expect(list.length).toBe(1);
    expect(list[0].pattern).toBe('com.noise');
    expect(list[0].levels?.has('DEBUG')).toBe(true);
  });
});
