import { describe, it, expect } from 'vitest';
import { formatDate } from '../src/utils/xil-log-date-format.js';

describe('dateFormat', () => {
  it('yyyy-MM-dd HH:mm:ss.SSS', () => {
    const d = new Date(2024, 0, 15, 9, 5, 3, 42);
    expect(formatDate(d, 'yyyy-MM-dd HH:mm:ss.SSS')).toBe(
      '2024-01-15 09:05:03.042'
    );
  });
  it('只替换出现的占位符', () => {
    const d = new Date(2024, 0, 1, 0, 0, 0, 0);
    expect(formatDate(d, 'yyyy')).toBe('2024');
    expect(formatDate(d, 'MM')).toBe('01');
    expect(formatDate(d, 'dd')).toBe('01');
    expect(formatDate(d, 'HH:mm:ss')).toBe('00:00:00');
    expect(formatDate(d, 'SSS')).toBe('000');
  });
  it('个位数补零', () => {
    const d = new Date(2024, 0, 5, 1, 2, 3, 4);
    expect(formatDate(d, 'yyyy-MM-dd HH:mm:ss.SSS')).toMatch(
      /01-05 01:02:03.004/
    );
  });
});
