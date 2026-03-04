import { describe, it, expect } from 'vitest';
import {
  appliesTo,
  createExcludeItem,
  type XilLogExcludeItem,
} from '../src/entity/xil-log-exclude-item.js';

describe('XilLogExcludeItem', () => {
  describe('createExcludeItem', () => {
    it('pattern 做 trim，levels 空则 null', () => {
      const item = createExcludeItem('  com.foo  ', null);
      expect(item.pattern).toBe('com.foo');
      expect(item.levels).toBe(null);
    });
    it('levels 非空时复制为 Set', () => {
      const item = createExcludeItem('x', new Set(['INFO', 'WARN']));
      expect(item.levels).not.toBe(null);
      expect(item.levels!.has('INFO')).toBe(true);
      expect(item.levels!.has('WARN')).toBe(true);
    });
  });

  describe('appliesTo', () => {
    it('无 pattern 返回 false', () => {
      const item: XilLogExcludeItem = { pattern: '', levels: null };
      expect(appliesTo(item, 'INFO')).toBe(false);
      expect(appliesTo({ pattern: '  ', levels: null }, 'INFO')).toBe(false);
    });
    it('levels 为 null 或空表示对所有级别生效', () => {
      const item = createExcludeItem('com.foo', null);
      expect(appliesTo(item, 'TRACE')).toBe(true);
      expect(appliesTo(item, 'ERROR')).toBe(true);
    });
    it('levels 含该级别时生效', () => {
      const item = createExcludeItem('com.foo', new Set(['INFO', 'WARN']));
      expect(appliesTo(item, 'INFO')).toBe(true);
      expect(appliesTo(item, 'WARN')).toBe(true);
      expect(appliesTo(item, 'ERROR')).toBe(false);
    });
  });
});
