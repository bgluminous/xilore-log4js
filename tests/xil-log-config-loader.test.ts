import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/config/xil-log-config-loader.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('XilLogConfigLoader', () => {
  describe('loadConfig', () => {
    it('无配置文件时返回基于默认的 XilLogPropertiesConfig', () => {
      const config = loadConfig(join(__dirname, 'fixtures-empty'));
      expect(config).toBeDefined();
      expect(config.getPath()).toBe('.');
      expect(config.getFilePrefix()).toBe('app');
    });

    it('从 xilore.json 的 log 节点加载', () => {
      const dir = join(__dirname, 'fixtures-json');
      const config = loadConfig(dir);
      expect(config.getPath()).toBe('/tmp/logs');
      expect(config.getFilePrefix()).toBe('myapp');
    });
  });
});
