/**
 * 简单实现 Java 风格日期格式 yyyy-MM-dd HH:mm:ss.SSS
 */
export function formatDate(date: Date, pattern: string): string {
  const y = date.getFullYear();
  const M = date.getMonth() + 1;
  const d = date.getDate();
  const H = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const S = date.getMilliseconds();
  return pattern
    .replace('yyyy', String(y))
    .replace('MM', pad2(M))
    .replace('dd', pad2(d))
    .replace('HH', pad2(H))
    .replace('mm', pad2(m))
    .replace('ss', pad2(s))
    .replace('SSS', pad3(S));
}

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}
function pad3(n: number): string {
  if (n < 10) {
    return '00' + n;
  }
  if (n < 100) {
    return '0' + n;
  }
  return String(n);
}
