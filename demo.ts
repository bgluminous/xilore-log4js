import {
  getLogger,
  setConfig,
  shutdownIfPresent,
  loadConfig,
  XilLogPropertiesConfig,
  XilLogLevels,
  parseLevel,
} from './dist/index.js';

/**
 * ⚠ 注意：为什么日志里的行号都是 demo.ts:1？
 *
 * 这个 demo 是通过 `tsx demo.ts`（或 ts-node 等运行时编译器）直接运行 TS 源码。
 * 运行时会先把 `demo.ts` 编译成压缩后的 JS，这个 JS 通常被压成 1 行左右，
 * 且当前示例没有开启 source map 反查 TS 源码行号。
 *
 * 因此 logger 在通过 Error.stack 解析调用位置时，看到的都是“编译后 JS 的第 1 行”，
 * 再映射回文件名时就变成了统一的 `demo.ts:1`。这是运行方式导致的正常现象，不是 bug。
 * 如需精确到 TS 源码行号，需要结合 source map + source-map-support 做额外解析。
 */


// ---------------------------------------------------------------------------
// 1. 按字符串名称获取 logger
// ---------------------------------------------------------------------------
const log = getLogger('demo');
log.warn(
  `
  ================================================

  ⚠ 注意：demo.ts 通过 tsx/ts-node 运行时编译，
  调用栈基于压缩后的 JS，第 1 行，
  所以日志里的行号会统一显示为 demo.ts:1（不是 bug）。

  ================================================
  `,
);
log.info('Hello xilore-log4js');

// ---------------------------------------------------------------------------
// 2. 按类/构造函数获取 logger（名称为类名或 name）
// ---------------------------------------------------------------------------
class DemoService {}

const serviceLog = getLogger(DemoService);
serviceLog.info('Logger from class name:', DemoService.name);

const anonymousLog = getLogger({ name: 'CustomModule' });
anonymousLog.info('Logger from object with name');

// ---------------------------------------------------------------------------
// 3. 所有日志级别：仅消息
// ---------------------------------------------------------------------------
log.trace('TRACE 级别');
log.debug('DEBUG 级别');
log.info('INFO 级别');
log.warn('WARN 级别');
log.error('ERROR 级别');

// ---------------------------------------------------------------------------
// 4. 所有日志级别：消息 + 异常对象
// ---------------------------------------------------------------------------
const demoError = new Error('demo error');
log.trace('TRACE with error', demoError);
log.debug('DEBUG with error', demoError);
log.info('INFO with error', demoError);
log.warn('WARN with error', demoError);
log.error('ERROR with error', demoError);

// ---------------------------------------------------------------------------
// 5. parseLevel / XilLogLevels 工具
// ---------------------------------------------------------------------------
console.log('\n--- XilLogLevels ---');
console.log(XilLogLevels);
console.log('parseLevel("info") =>', parseLevel('info'));
console.log('parseLevel("invalid") =>', parseLevel('invalid'));

// ---------------------------------------------------------------------------
// 6. 程序化 setConfig：自定义配置（仅控制台、无颜色等）
// ---------------------------------------------------------------------------
const customProps: Record<string, string> = {
  path: '.',
  file_prefix: 'demo',
  date_format: 'yyyy-MM-dd HH:mm:ss.SSS',
  'detail.trace.print': 'true',
  'detail.trace.write': 'false',
  'detail.trace.upload': 'false',
  'detail.debug.print': 'true',
  'detail.debug.write': 'false',
  'detail.debug.upload': 'false',
  'detail.info.print': 'true',
  'detail.info.write': 'false',
  'detail.info.upload': 'false',
  'detail.warn.print': 'true',
  'detail.warn.write': 'false',
  'detail.warn.upload': 'false',
  'detail.error.print': 'true',
  'detail.error.write': 'false',
  'detail.error.upload': 'false',
  'upload.host': '',
  'upload.token': '',
  charset: 'UTF-8',
  app_name: 'demo-app',
  color: 'false',
  compress_width: 'true',
  'exclude.0.pattern': 'demo',
  'exclude.0.levels': 'debug,info',
};

setConfig(new XilLogPropertiesConfig(customProps));

const configLog = getLogger('config-demo');
configLog.info('使用 setConfig 后的 logger（无颜色、仅控制台）');
configLog.warn('WARN 也仅打印');

// ---------------------------------------------------------------------------
// 7. 恢复默认配置（从 xilore.json / xilore.yml / 环境变量加载）
// ---------------------------------------------------------------------------
setConfig(loadConfig());
const defaultLog = getLogger('default-config');
defaultLog.info('已恢复为 loadConfig() 的默认配置');

// ---------------------------------------------------------------------------
// 8. Logger 实例方法 getName()
// ---------------------------------------------------------------------------
console.log('\n--- getName() ---');
console.log('log.getName() =>', log.getName());
console.log('serviceLog.getName() =>', serviceLog.getName());
console.log('anonymousLog.getName() =>', anonymousLog.getName());

// ---------------------------------------------------------------------------
// 9. 优雅关闭：等待未完成的写文件/上传任务
// ---------------------------------------------------------------------------
await shutdownIfPresent();
console.log('shutdown 完成');

