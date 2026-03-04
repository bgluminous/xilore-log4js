import { describe, it, expect } from 'vitest';
import {
  padRight,
  leftPadUnderscore,
  formatThreadDisplay,
  abbreviateLoggerName,
  formatBasicLog,
  throwableToStack,
  WIDTHS,
} from '../src/utils/xil-log-format.js';

describe('format', () => {
  describe('padRight', () => {
    it('短于 width 时右侧补空格', () => {
      expect(padRight('ab', 5)).toBe('ab   ');
    });
    it('等于 width 时不变', () => {
      expect(padRight('abcde', 5)).toBe('abcde');
    });
    it('长于 width 时截断', () => {
      expect(padRight('abcdef', 5)).toBe('abcde');
    });
    it('空串与 null 视为空串', () => {
      expect(padRight('', 3)).toBe('   ');
      expect(padRight(null as unknown as string, 3)).toBe('   ');
    });
  });

  describe('leftPadUnderscore', () => {
    it('width <= 0 返回原串', () => {
      expect(leftPadUnderscore('ab', 0)).toBe('ab');
      expect(leftPadUnderscore('ab', -1)).toBe('ab');
    });
    it('短于 width 时左侧补空格', () => {
      expect(leftPadUnderscore('ab', 5)).toBe('   ab');
    });
    it('长于 width 时截断', () => {
      expect(leftPadUnderscore('abcdef', 5)).toBe('abcde');
    });
  });

  describe('formatThreadDisplay', () => {
    it('短于 THREAD_WIDTH 时返回原样', () => {
      expect(formatThreadDisplay('main:1', true)).toBe('main:1');
    });
    it('不压缩时截断到 THREAD_WIDTH', () => {
      expect(formatThreadDisplay('very-long-thread-name', false).length).toBe(WIDTHS.THREAD_WIDTH);
    });
    it('压缩时用下划线+尾部', () => {
      const longName = 'very-long-thread-name-12345';
      const r = formatThreadDisplay(longName, true);
      expect(r.startsWith('_')).toBe(true);
      expect(r.length).toBe(WIDTHS.THREAD_WIDTH);
    });
  });

  describe('abbreviateLoggerName', () => {
    it('空名或 width<=0 返回原样', () => {
      expect(abbreviateLoggerName('', true)).toBe('');
      expect(abbreviateLoggerName('a.b.C', false)).toBe('a.b.C');
    });
    it('不压缩时保持原样不截断', () => {
      const long = 'a'.repeat(100);
      expect(abbreviateLoggerName(long, false)).toBe(long);
    });
    it('短名不变', () => {
      expect(abbreviateLoggerName('MyClass', true)).toBe('MyClass');
    });
    it('压缩时缩写包名保留类名', () => {
      const r = abbreviateLoggerName('com.example.service.MyClass', true);
      expect(r.length).toBeLessThanOrEqual(WIDTHS.LOGGER_NAME_WIDTH);
      expect(r).toContain('MyClass');
    });
  });

  describe('formatBasicLog', () => {
    it('包含时间、级别、线程、logger、消息', () => {
      const out = formatBasicLog(
        'INFO',
        '2024-01-01 12:00:00.000',
        'main:1',
        'myapp',
        'MyClass',
        'hello',
        null,
        false,
        null
      );
      expect(out).toContain('INFO');
      expect(out).toContain('main:1');
      expect(out).toContain('MyClass');
      expect(out).toContain('hello');
      expect(out).toContain('myapp');
    });
    it('有 stack 时追加换行和 stack', () => {
      const out = formatBasicLog(
        'ERROR',
        '2024-01-01 12:00:00.000',
        'main:1',
        '',
        'X',
        'err',
        'at foo (bar:1)',
        false,
        null
      );
      expect(out).toContain('err');
      expect(out).toContain('at foo (bar:1)');
    });
    it('有 callSite 时 logger 带 (file:line)', () => {
      const out = formatBasicLog(
        'INFO',
        '2024-01-01 12:00:00.000',
        'main:1',
        '',
        'MyClass',
        'msg',
        null,
        false,
        'demo.ts:8'
      );
      expect(out).toContain('demo.ts:8');
    });
  });

  describe('throwableToStack', () => {
    it('null/undefined 返回 null', () => {
      expect(throwableToStack(null)).toBe(null);
      expect(throwableToStack(undefined)).toBe(null);
    });
    it('Error 返回 stack 或 message', () => {
      const err = new Error('test');
      const stack = throwableToStack(err);
      expect(stack).toBeTruthy();
      expect(stack).toContain('test');
    });
    it('非 Error 对象返回 String(val)', () => {
      expect(throwableToStack('oops')).toBe('oops');
      expect(throwableToStack(123)).toBe('123');
    });
  });
});
