import { existsSync, readFileSync } from 'node:fs';
import { platform } from 'node:os';

const DOCKER_ENV_FILE = '/.dockerenv';
const CGROUP_FILE = '/proc/self/cgroup';

/**
 * 获取容器/环境标识。
 * - 若存在 /.dockerenv，从 /proc/self/cgroup 解析容器 ID（仅 Linux）。
 * - 否则从环境变量 CONTAINER_ID、HOSTNAME 回退。
 */
export function getContainerId(): string {
  if (platform() !== 'linux' || !existsSync(DOCKER_ENV_FILE)) {
    return envFallback();
  }
  try {
    const content = readFileSync(CGROUP_FILE, 'utf8');
    const lines = content.split('\n').filter((l) => l.trim());
    const lastLine = lines[lines.length - 1];
    if (!lastLine?.trim()) {
      return 'unknown';
    }
    const idx = lastLine.lastIndexOf('/');
    const id = idx < 0 ? lastLine.trim() : lastLine.substring(idx + 1).trim();
    return id || 'unknown';
  } catch {
    return 'unknown';
  }
}

function envFallback(): string {
  const v = process.env.CONTAINER_ID;
  if (v?.trim()) {
    return v.trim();
  }
  const h = process.env.HOSTNAME;
  return h?.trim() ?? '';
}
