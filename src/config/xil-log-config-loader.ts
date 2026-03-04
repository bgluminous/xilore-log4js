import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { XilLogPropertiesConfig } from './xil-log-properties-config.js';
import type { XilLogConfig } from './xil-log-config.js';

const require = createRequire(import.meta.url);

const PREFIX = 'log.';

function normalizeKey(key: string): string {
  let k = key;
  if (k.startsWith(PREFIX)) {
    k = k.slice(PREFIX.length);
  }
  if (k.startsWith('xilore.log.')) {
    k = k.slice('xilore.log.'.length);
  }
  return k;
}

function flattenInto(
  target: Map<string, string>,
  source: Record<string, unknown>,
  prefix: string
): void {
  if (source == null || typeof source !== 'object') {
    return;
  }
  for (const [k, v] of Object.entries(source)) {
    const segment = k.trim().toLowerCase();
    const key = prefix + segment;
    if (v != null && typeof v === 'object') {
      if (Array.isArray(v)) {
        v.forEach((item, i) => {
          if (item != null && typeof item === 'object' && !Array.isArray(item)) {
            flattenInto(target, item as Record<string, unknown>, `${key}.${i}.`);
          } else {
            target.set(normalizeKey(`${key}.${i}`), String(item).trim());
          }
        });
      } else if (!(v instanceof Date)) {
        flattenInto(target, v as Record<string, unknown>, key + '.');
      }
    } else if (v != null) {
      target.set(normalizeKey(key), String(v).trim());
    }
  }
}

function loadFromJson(map: Map<string, string>, cwd: string): boolean {
  for (const name of ['xilore.json']) {
    const p = join(cwd, name);
    if (!existsSync(p)) {
      continue;
    }
    try {
      const content = readFileSync(p, 'utf8');
      const data = JSON.parse(content) as Record<string, unknown>;
      const log = data?.log as Record<string, unknown> | undefined;
      if (log && typeof log === 'object') {
        flattenInto(map, log, '');
      } else if (data && typeof data === 'object') {
        flattenInto(map, data, '');
      }
      return true;
    } catch {
      // ignore
    }
  }
  return false;
}

function loadFromYaml(map: Map<string, string>, cwd: string): boolean {
  let yaml: { load: (s: string) => unknown } | null = null;
  try {
    yaml = require('js-yaml') as { load: (s: string) => unknown };
  } catch {
    return false;
  }
  if (!yaml?.load) {
    return false;
  }
  for (const name of ['xilore.yml', 'xilore.yaml']) {
    const p = join(cwd, name);
    if (!existsSync(p)) {
      continue;
    }
    try {
      const content = readFileSync(p, 'utf8');
      const data = yaml.load(content) as Record<string, unknown>;
      const log = data?.log as Record<string, unknown> | undefined;
      if (log && typeof log === 'object') {
        flattenInto(map, log, '');
      } else if (data && typeof data === 'object') {
        flattenInto(map, data, '');
      }
      return true;
    } catch {
      // ignore
    }
  }
  return false;
}

function loadFromEnv(map: Map<string, string>): void {
  for (const [k, v] of Object.entries(process.env)) {
    if (v == null) {
      continue;
    }
    const key = k.trim().toLowerCase();
    if (!key.startsWith(PREFIX)) {
      continue;
    }
    map.set(normalizeKey(key), v.trim());
  }
}

/**
 * 按优先级加载配置：json → yaml → 环境变量覆盖。
 * 搜索路径：process.cwd()，以及逐级向上查找 xilore.json / xilore.yml。
 */
export function loadConfig(searchDir?: string): XilLogConfig {
  const map = new Map<string, string>();
  const cwd = searchDir ?? process.cwd();
  if (!loadFromJson(map, cwd)) {
    loadFromYaml(map, cwd);
  }
  loadFromEnv(map);
  return new XilLogPropertiesConfig(map);
}
