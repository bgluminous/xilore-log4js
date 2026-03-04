import { describe, it, expect } from 'vitest';
import { colorize, isColorDisabledByEnv } from '../src/utils/xil-log-ansi.js';

describe('ansi', () => {
  describe('colorize', () => {
    it('空 level 或 null text 返回原 text', () => {
      expect(colorize('' as any, 'hello')).toBe('hello');
      expect(colorize('INFO', null as unknown as string)).toBe('');
    });
    it('有效 level 返回带 ANSI 前缀后缀', () => {
      const r = colorize('INFO', 'msg');
      expect(r).toContain('msg');
      expect(r).toMatch(/\u001B\[/);
      expect(r).toMatch(/0m$/);
    });
    it('各级别有不同前缀', () => {
      expect(colorize('ERROR', 'x')).toContain('31'); // red
      expect(colorize('WARN', 'x')).toContain('33'); // yellow
      expect(colorize('INFO', 'x')).toContain('32'); // green
      expect(colorize('DEBUG', 'x')).toContain('34'); // blue
      expect(colorize('TRACE', 'x')).toContain('36'); // cyan
    });
  });

  describe('isColorDisabledByEnv', () => {
    it('返回布尔值', () => {
      expect(typeof isColorDisabledByEnv()).toBe('boolean');
    });
    it('当 NO_COLOR 存在时返回 true', () => {
      const prev = process.env.NO_COLOR;
      process.env.NO_COLOR = '1';
      try {
        expect(isColorDisabledByEnv()).toBe(true);
      } finally {
        if (prev !== undefined) {
          process.env.NO_COLOR = prev;
        } else {
          delete process.env.NO_COLOR;
        }
      }
    });
  });
});
