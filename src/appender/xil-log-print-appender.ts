import type { XilLogEntity } from '../entity/xil-log-entity.js';
import type { XilLogConfig } from '../config/xil-log-config.js';
import { colorize, isColorDisabledByEnv } from '../utils/xil-log-ansi.js';

const COLOR_DISABLED_BY_ENV = isColorDisabledByEnv();

export class XilLogPrintAppender {
  private readonly useColor: boolean;

  constructor(config: XilLogConfig | null) {
    this.useColor =
      !COLOR_DISABLED_BY_ENV && (config == null || config.isColorEnabled());
  }

  append(entity: XilLogEntity | null): void {
    if (entity == null) {
      return;
    }
    const line = this.useColor
      ? colorize(entity.level, entity.basicLog)
      : entity.basicLog;
    process.stdout.write(line + '\n');
  }
}
