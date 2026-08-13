/**
 * Multi-calendar helpers for Medal Archive Pro.
 * Converts between Jalali / Hijri / Gregorian.
 * Backend DateField always receives ISO Gregorian: YYYY-MM-DD
 */

export type CalendarType = "jalali" | "hijri" | "gregorian";

export interface CalendarParts {
  year: number;
  month: number;
  day: number;
}

export const CALENDAR_LABELS: Record<CalendarType, string> = {
  jalali: "شمسی",
  hijri: "قمری",
  gregorian: "میلادی",
};

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const HIJRI_MONTHS = [
  "محرم", "صفر", "ربیع‌الاول", "ربیع‌الثانی", "جمادی‌الاول", "جمادی‌الثانی",
  "رجب", "شعبان", "رمضان", "شوال", "ذی‌القعده", "ذی‌الحجه",
];

const GREGORIAN_MONTHS = [
  "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن",
  "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر",
];

export function monthNames(calendar: CalendarType): string[] {
  if (calendar === "jalali") return JALALI_MONTHS;
  if (calendar === "hijri") return HIJRI_MONTHS;
  return GREGORIAN_MONTHS;
}

function div(a: number, b: number) {
  return Math.floor(a / b);
}

function jalaliToGregorian(jy: number, jm: number, jd: number): CalendarParts {
  const jy2 = jy - 979;
  const jm2 = jm - 1;
  const jd2 = jd - 1;
  let j_day_no =
    365 * jy2 + div(jy2, 33) * 8 + div((jy2 % 33) + 3, 4) + 78 + jd2;
  for (let i = 0; i < jm2; ++i) {
    j_day_no += i < 6 ? 31 : 30;
  }
  let g_day_no = j_day_no + 79;
  let gy = 1600 + 400 * div(g_day_no, 146097);
  g_day_no = g_day_no % 146097;
  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * div(g_day_no, 36524);
    g_day_no = g_day_no % 36524;
    if (g_day_no >= 365) g_day_no++;
    else leap = false;
  }
  gy += 4 * div(g_day_no, 1461);
  g_day_no %= 1461;
  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += div(g_day_no, 365);
    g_day_no = g_day_no % 365;
  }
  const sal_a = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 0; gm < 13 && g_day_no >= sal_a[gm]; gm++) {
    g_day_no -= sal_a[gm];
  }
  return { year: gy, month: gm, day: g_day_no + 1 };
}

function gregorianToJalali(gy: number, gm: number, gd: number): CalendarParts {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gy - 1600;
  const gm2 = gm - 1;
  const gd2 = gd - 1;
  let g_day_no =
    365 * gy2 +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 +
    gd2 +
    g_d_m[gm2];
  if (gm2 > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) {
    g_day_no++;
  }
  let j_day_no = g_day_no - 79;
  const j_np = div(j_day_no, 12053);
  j_day_no %= 12053;
  let jy = 979 + 33 * j_np + 4 * div(j_day_no, 1461);
  j_day_no %= 1461;
  if (j_day_no >= 366) {
    jy += div(j_day_no - 1, 365);
    j_day_no = (j_day_no - 1) % 365;
  }
  let jm = 0;
  const j_days = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  for (jm = 0; jm < 12 && j_day_no >= j_days[jm]; jm++) {
    j_day_no -= j_days[jm];
  }
  return { year: jy, month: jm + 1, day: j_day_no + 1 };
}

function gregorianToJulian(gy: number, gm: number, gd: number): number {
  if (gm <= 2) {
    gy -= 1;
    gm += 12;
  }
  const a = Math.floor(gy / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (gy + 4716)) +
    Math.floor(30.6001 * (gm + 1)) +
    gd +
    b -
    1524.5
  );
}

function julianToGregorian(jd: number): CalendarParts {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { year, month, day: Math.floor(day) };
}

function hijriToGregorian(hy: number, hm: number, hd: number): CalendarParts {
  const jd =
    Math.floor((11 * hy + 3) / 30) +
    354 * hy +
    30 * hm -
    Math.floor((hm - 1) / 2) +
    hd +
    1948440 -
    385;
  return julianToGregorian(jd);
}

function gregorianToHijri(gy: number, gm: number, gd: number): CalendarParts {
  const jd = gregorianToJulian(gy, gm, gd);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hm = Math.floor((24 * l3) / 709);
  const hd = l3 - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;
  return { year: hy, month: hm, day: hd };
}

export function partsToGregorian(
  parts: CalendarParts,
  calendar: CalendarType
): CalendarParts {
  if (calendar === "gregorian") return { ...parts };
  if (calendar === "jalali")
    return jalaliToGregorian(parts.year, parts.month, parts.day);
  return hijriToGregorian(parts.year, parts.month, parts.day);
}

export function gregorianToParts(
  parts: CalendarParts,
  calendar: CalendarType
): CalendarParts {
  if (calendar === "gregorian") return { ...parts };
  if (calendar === "jalali")
    return gregorianToJalali(parts.year, parts.month, parts.day);
  return gregorianToHijri(parts.year, parts.month, parts.day);
}

export function toIsoDate(parts: CalendarParts): string {
  const y = String(parts.year).padStart(4, "0");
  const m = String(parts.month).padStart(2, "0");
  const d = String(parts.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(
  iso: string | null | undefined
): CalendarParts | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d };
}

export function formatDisplay(
  parts: CalendarParts,
  _calendar: CalendarType
): string {
  const m = String(parts.month).padStart(2, "0");
  const d = String(parts.day).padStart(2, "0");
  return `${parts.year}/${m}/${d}`;
}

export function daysInMonth(
  year: number,
  month: number,
  calendar: CalendarType
): number {
  if (calendar === "gregorian") {
    return new Date(year, month, 0).getDate();
  }
  if (calendar === "jalali") {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    const a = (year - (year > 0 ? 474 : 473)) % 2820 + 474;
    const leap = (((a + 38) * 682) % 2816) < 682;
    return leap ? 30 : 29;
  }
  return month % 2 === 1 ? 30 : 29;
}

export function yearRange(
  calendar: CalendarType
): { min: number; max: number } {
  if (calendar === "jalali") return { min: 1200, max: 1450 };
  if (calendar === "hijri") return { min: 1200, max: 1500 };
  return { min: 1800, max: 2030 };
}
