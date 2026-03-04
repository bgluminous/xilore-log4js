# Xilore Log4js

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node 16+](https://img.shields.io/badge/Node-16+-orange.svg)](https://nodejs.org/)

轻量级 TypeScript/Node 日志库，参考 [xilore-log4j](https://git.kiiiv.com/Luminous/xilore-log4j) 设计，提供**控制台 / 按日滚动文件 / 远程上传**三种输出，支持 JSON/YAML 配置与按包/类排除。

---

## 特性

- **门面 API**：`getLogger(name)` 或 `getLogger(MyClass)`，支持 `trace` / `debug` / `info` / `warn` / `error`
- **三种输出**：控制台（Print）、按日滚动写文件（Write）、远程上传（Upload），各级别可单独开关
- **多格式配置**：支持 `xilore.json`、`xilore.yml` / `xilore.yaml`（需安装可选依赖 `js-yaml`），环境变量 `log.*` 可覆盖
- **包/类排除**：按名称模式排除日志，可限定生效级别
- **控制台彩色**：基于 ANSI 的级别着色，可通过配置或 `NO_COLOR` 关闭
- **容器标识**：自动解析 Docker/cgroup 或环境变量 `CONTAINER_ID`、`HOSTNAME`
- **宽度压缩**：超长 logger 名可缩写显示

---

## 环境要求

- **Node.js 16+**
- **TypeScript 5.x**（仅构建时）
- 可选：**js-yaml**（用于 YAML 配置）

---

## 安装

```bash
npm install xilore-log4js
# 若使用 YAML 配置
npm install js-yaml
```

---

## 快速开始

### 1. 使用 getLogger（推荐）

```ts
import { getLogger } from 'xilore-log4js';

const log = getLogger('my-app');
log.info('Hello xilore-log4js');
log.warn('Warning', new Error('demo'));
```

### 2. 按类名获取 Logger

```ts
import { getLogger } from 'xilore-log4js';

class App {
  private static log = getLogger(App);
  run() {
    App.log.info('running');
  }
}
```

### 3. 配置文件

将配置放在**项目根目录**（与 `package.json` 同级），任选其一：

| 文件            | 说明                    |
|-----------------|-------------------------|
| `xilore.json`   | JSON，始终可加载        |
| `xilore.yml` / `xilore.yaml` | 需安装 `js-yaml` 时使用 |

加载优先级：**xilore.json → xilore.yml**，环境变量中键以 `log.` 开头的会覆盖已加载配置。

#### xilore.json 示例

```json
{
  "log": {
    "path": ".",
    "file_prefix": "app",
    "date_format": "yyyy-MM-dd HH:mm:ss.SSS",
    "detail": {
      "trace": { "print": true, "write": false, "upload": false },
      "debug": { "print": true, "write": false, "upload": false },
      "info": { "print": true, "write": false, "upload": false },
      "warn": { "print": true, "write": true, "upload": false },
      "error": { "print": true, "write": true, "upload": true }
    },
    "upload": { "host": "", "token": "" },
    "charset": "UTF-8",
    "app_name": "my-app",
    "color": true,
    "compress_width": true,
    "exclude": [
      { "pattern": "com.third.party", "levels": ["debug", "info"] },
      "org.noise"
    ]
  }
}
```

#### xilore.yml 示例

```yaml
log:
  path: .
  file_prefix: app
  date_format: "yyyy-MM-dd HH:mm:ss.SSS"
  detail:
    trace: { print: true, write: false, upload: false }
    debug: { print: true, write: false, upload: false }
    info:  { print: true, write: false, upload: false }
    warn:  { print: true, write: true, upload: false }
    error: { print: true, write: true, upload: true }
  upload: { host: "", token: "" }
  charset: UTF-8
  app_name: my-app
  color: true
  compress_width: true
  exclude:
    - pattern: com.third.party
      levels: [debug, info]
    - org.noise
```

---

## 配置项摘要

| 配置键 | 说明 | 默认值 |
|--------|------|--------|
| `path` | 日志文件目录 | `.` |
| `file_prefix` | 日志文件名前缀（文件为 `path/file_prefix+yyyy-MM-dd.log`） | `app` |
| `date_format` | 日期格式 | `yyyy-MM-dd HH:mm:ss.SSS` |
| `detail.{level}.print` / `.write` / `.upload` | 该级别是否输出到控制台/写文件/上传 | 未配置时仅 print |
| `upload.host` / `upload.token` | 上传服务地址与 token，host 为空则不上传 | 空 |
| `charset` | 字符集 | `UTF-8` |
| `app_name` | 应用名，日志中显示为 `[appName]` | 空 |
| `color` | 控制台是否彩色 | `true` |
| `compress_width` | 是否压缩 logger 名宽度 | `true` |
| `exclude` | 不输出日志的包或类排除项，可配 `levels` 限定级别 | 空 |

---

## API

- `getLogger(name: string): XilLogger`
- `getLogger(ctor: Function | { name?: string }): XilLogger`
- `shutdownIfPresent(): void` — 关闭 runner，等待未完成任务
- `setConfig(config: XilLogConfig | null): void` — 注入配置（测试或程序化配置）

`XilLogger` 方法：`trace`, `debug`, `info`, `warn`, `error`，每个支持 `(message: string)` 或 `(message: string, err?: unknown)`。

---

## 开发与测试

```bash
npm install
npm run test        # 运行测试
npm run test:watch  # 监听模式
npm run build       # 编译
```

## 构建与发布

```bash
npm run build
```

发布前会自动执行 `npm run test && npm run build`（`prepublishOnly`）。

**堆栈显示为 .ts 源文件**：运行编译后的代码时使用 `node --enable-source-maps dist/xxx.js`，或安装可选依赖 `source-map-support`，日志中的错误堆栈会显示 TypeScript 源文件（如 `demo.ts:8:32`）而非编译后的 `.js`。

---

## 许可证

[MIT License](https://opensource.org/licenses/MIT)
