/**
 * 某日志级别的输出开关：控制是否输出到控制台、写文件、上传。
 */
export interface XilLogLevelSwitch {
  print: boolean;
  write: boolean;
  upload: boolean;
}

export function createLevelSwitch(
  print: boolean,
  write: boolean,
  upload: boolean
): XilLogLevelSwitch {
  return { print, write, upload };
}
