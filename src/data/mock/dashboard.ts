import type {
  DashboardSummary,
  CountryReport,
  ValueReport,
  PurchaseReport,
} from "@/types/api";

export const MOCK_DASHBOARD: DashboardSummary = {
  total_medals: 8,
  countries: 4,
  oldest_year: 1906,
  newest_year: 1984,
  value_by_currency: [
    { currency: "IRR", total: "73000000", count: 5 },
    { currency: "EUR", total: "4980", count: 2 },
    { currency: "USD", total: "3500", count: 1 },
    { currency: "GBP", total: "920", count: 1 },
  ],
  medals_by_category: [
    { name: "سلطنتی", count: 2 },
    { name: "یادبود", count: 2 },
    { name: "ورزشی", count: 2 },
    { name: "نظامی", count: 1 },
    { name: "علمی و فرهنگی", count: 1 },
  ],
  medals_by_country_top: [
    { country: "ایران", count: 5 },
    { country: "آلمان", count: 1 },
    { country: "ایالات متحده", count: 1 },
  ],
};

export const MOCK_COUNTRY_REPORT: CountryReport = {
  total_medals: 8,
  items: [
    { country: "ایران", count: 5, percent: 62.5 },
    { country: "آلمان", count: 1, percent: 12.5 },
    { country: "ایالات متحده", count: 1, percent: 12.5 },
    { country: "سایر", count: 1, percent: 12.5 },
  ],
};

export const MOCK_VALUE_REPORT: ValueReport = {
  by_currency: [
    { currency: "IRR", total: "73000000" },
    { currency: "EUR", total: "4980" },
    { currency: "USD", total: "3500" },
    { currency: "GBP", total: "920" },
  ],
  by_country: [
    { country: "ایران", total_irr: "73000000" },
    { country: "آلمان", total_eur: "180" },
    { country: "ایالات متحده", total_usd: "3500" },
  ],
  by_category: [
    { name: "سلطنتی", total: "46800000" },
    { name: "ورزشی", total: "3680" },
    { name: "یادبود", total: "14200000" },
  ],
  over_time: [
    { year: 2018, count: 1 },
    { year: 2019, count: 1 },
    { year: 2020, count: 2 },
    { year: 2021, count: 2 },
    { year: 2022, count: 1 },
    { year: 2023, count: 1 },
  ],
  note: "ارزش‌ها بدون تبدیل نرخ ارز گروه‌بندی شده‌اند.",
};

export const MOCK_PURCHASE_REPORT: PurchaseReport = {
  purchase_count: 8,
  by_year: [
    { year: 2018, count: 1 },
    { year: 2019, count: 1 },
    { year: 2020, count: 2 },
    { year: 2021, count: 2 },
    { year: 2022, count: 1 },
    { year: 2023, count: 1 },
  ],
  by_currency: [
    { currency: "IRR", count: 5 },
    { currency: "EUR", count: 2 },
    { currency: "USD", count: 1 },
    { currency: "GBP", count: 1 },
  ],
  by_seller: [
    { seller: "گالری هنر پارس", count: 1 },
    { seller: "Heritage Auctions", count: 1 },
    { seller: "Sotheby's", count: 1 },
  ],
  by_country: [
    { country: "ایران", count: 5 },
    { country: "آلمان", count: 1 },
    { country: "ایالات متحده", count: 1 },
  ],
  note: "بر اساس سوابق خرید ثبت‌شده در سیستم.",
};

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "مدال جدید ثبت شد",
    body: "مدال «نشان درجه اول همایون» به آرشیو اضافه شد.",
    time: "۲ ساعت پیش",
    read: false,
    type: "medal" as const,
  },
  {
    id: 2,
    title: "ارزیابی به‌روز شد",
    body: "ارزش مدال تاج‌گذاری به ۴۲٬۰۰۰٬۰۰۰ ریال به‌روز شد.",
    time: "دیروز",
    read: false,
    type: "valuation" as const,
  },
  {
    id: 3,
    title: "کاربر جدید دعوت شد",
    body: "دعوت‌نامه برای ندا کریمی ارسال شد.",
    time: "۳ روز پیش",
    read: true,
    type: "user" as const,
  },
  {
    id: 4,
    title: "پشتیبان‌گیری سیستم",
    body: "پشتیبان‌گیری هفتگی با موفقیت انجام شد.",
    time: "۱ هفته پیش",
    read: true,
    type: "system" as const,
  },
];
