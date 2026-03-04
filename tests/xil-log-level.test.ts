import { describe, it, expect } from 'vitest';
import { XilLogLevels, parseLevel } from '../src/xil-log-level.js';

describe('XilLogLevel', () => {
  describe('XilLogLevels', () => {
    it('应包含 TRACE DEBUG INFO WARN ERROR', () => {
      expect(XilLogLevels).toEqual(['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']);
    });
  });

  describe('parseLevel', () => {
    it('解析小写返回大写', () => {
      expect(parseLevel('trace')).toBe('TRACE');
      expect(parseLevel('info')).toBe('INFO');
      expect(parseLevel('error')).toBe('ERROR');
    });
    it('解析大写返回原样', () => {
      expect(parseLevel('DEBUG')).toBe('DEBUG');
      expect(parseLevel('WARN')).toBe('WARN');
    });
    it('前后空格被 trim', () => {
      expect(parseLevel('  INFO  ')).toBe('INFO');
    });
    it('无效名称返回 null', () => {
      expect(parseLevel('')).toBe(null);
      expect(parseLevel('   ')).toBe(null);
      expect(parseLevel('FOO')).toBe(null);
      expect(parseLevel('unknown')).toBe(null);
    });
    it('null/undefined 经 trim 后视为空', () => {
      expect(parseLevel(null as unknown as string)).toBe(null);
    });
  });
});
