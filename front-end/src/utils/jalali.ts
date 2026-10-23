// Helpers for the Jalali (Shamsi) calendar used by the due-date picker.
//
// The actual Gregorian <-> Jalali conversion lives in the FastAPI backend
// (`jdatetime` library — see backend/requirements.txt). The frontend only:
//   1. parses the "YYYY/MM/DD" strings the API returns (due_date_jalali),
//   2. renders the three dropdowns (day / month / year),
//   3. clamps the day count per month (31 / 30 / 29-30 Esfand) using the
//      leap-year list served by /api/utils/jalali-meta.
// No conversion math is duplicated in JavaScript — strings go back and forth.

export interface JalaliParts {
  y: number;
  m: number;
  d: number;
}

// Parse "1404/08/15", "1404/8/5" (optionally followed by a time part).
export function parseJalaliString(
  value: string | null | undefined
): JalaliParts | null {
  if (!value) return null;
  const match = String(value)
    .trim()
    .match(/^(\d{3,4})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y: y, m: m, d: d };
}

export function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

export function formatJalali(p: JalaliParts): string {
  return p.y + '/' + pad2(p.m) + '/' + pad2(p.d);
}

// Jalali month lengths: months 1-6 have 31 days, months 7-11 have 30 and
// Esfand (12) has 30 in leap years, 29 otherwise. The leap-year list comes
// from the backend (source of truth: jdatetime).
export function jalaliMonthLength(
  month: number,
  year: number,
  leapYears: number[]
): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return leapYears.indexOf(year) !== -1 ? 30 : 29;
}
