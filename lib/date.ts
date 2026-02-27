export function getIsoWeekNumber(date: Date): number {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getCurrentWeekNumber(now: Date = new Date()): number {
  return getIsoWeekNumber(now);
}

export function parseDayMonthToken(token: string, now: Date = new Date()): string | undefined {
  const match = token.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (!match) {
    return undefined;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return undefined;
  }

  const year = now.getFullYear();
  const candidate = new Date(year, month - 1, day, 8, 0, 0, 0);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return undefined;
  }

  return candidate.toISOString();
}
