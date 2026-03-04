/**
 * xilore-log4js 全场景 demo：
 * - 按名称/类获取 logger
 * - 各级别日志（仅消息 / 消息+异常）
 * - 程序化 setConfig
 * - parseLevel / XilLogLevels
 * - 优雅关闭 shutdownIfPresent
 */
import {
  getLogger,
  setConfig,
  shutdownIfPresent,
  loadConfig,
  XilLogPropertiesConfig,
  XilLogLevels,
  parseLevel,
} from './dist/index.js';

// ---------------------------------------------------------------------------
// 1. 按字符串名称获取 logger
// ---------------------------------------------------------------------------
const log = getLogger('demo');
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
const customProps = {
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
