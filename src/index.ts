/**
 * xilore-log4js
 * 轻量级 TypeScript/Node 日志库，参考 xilore-log4j 设计：
 * 控制台 / 按日滚动文件 / 远程上传 三种输出，支持 JSON/YAML 配置。
 */

export { getLogger, shutdownIfPresent, setConfig, XilLogger } from './xil-logger.js';
export type { XilLogLevel } from './xil-log-level.js';
export { XilLogLevels, parseLevel } from './xil-log-level.js';
export type { XilLogConfig } from './config/xil-log-config.js';
export { loadConfig } from './config/xil-log-config-loader.js';
export { XilLogPropertiesConfig } from './config/xil-log-properties-config.js';
export type { XilLogEntity } from './entity/xil-log-entity.js';
export type { XilLogExcludeItem } from './entity/xil-log-exclude-item.js';
export type { XilLogLevelSwitch } from './entity/xil-log-level-switch.js';
