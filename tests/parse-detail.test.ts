import { describe, it, expect } from 'vitest';
import { parseLevelSwitch } from '../src/utils/xil-log-parse-detail.js';

describe('parseDetail', () => {
  describe('parseLevelSwitch', () => {
    it('空或空白返回全关', () => {
      const s = parseLevelSwitch('');
      expect(s.print).toBe(false);
      expect(s.write).toBe(false);
      expect(s.upload).toBe(false);
      const s2 = parseLevelSwitch('  ');
      expect(s2.print).toBe(false);
      expect(s2.write).toBe(false);
      expect(s2.upload).toBe(false);
      const s3 = parseLevelSwitch(null);
      expect(s3.print).toBe(false);
      expect(s3.write).toBe(false);
      expect(s3.upload).toBe(false);
    });
    it('print 开启 print', () => {
      const s = parseLevelSwitch('print');
      expect(s.print).toBe(true);
      expect(s.write).toBe(false);
      expect(s.upload).toBe(false);
    });
    it('write,upload 开启对应项', () => {
      const s = parseLevelSwitch('write,upload');
      expect(s.print).toBe(false);
      expect(s.write).toBe(true);
      expect(s.upload).toBe(true);
    });
    it('逗号分隔多值', () => {
      const s = parseLevelSwitch('print, write , upload');
      expect(s.print).toBe(true);
      expect(s.write).toBe(true);
      expect(s.upload).toBe(true);
    });
    it('大小写不敏感', () => {
      const s = parseLevelSwitch('PRINT,Write');
      expect(s.print).toBe(true);
      expect(s.write).toBe(true);
    });
  });
});
