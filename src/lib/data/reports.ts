import type {
  DashboardSummary,
  CountryReport,
  ValueReport,
  PurchaseReport,
} from "@/types/api";
import {
  MOCK_DASHBOARD,
  MOCK_COUNTRY_REPORT,
  MOCK_VALUE_REPORT,
  MOCK_PURCHASE_REPORT,
  MOCK_NOTIFICATIONS,
} from "@/data/mock/dashboard";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getDashboard(): Promise<DashboardSummary> {
  await delay();
  return MOCK_DASHBOARD;
}

export async function getCountryReport(): Promise<CountryReport> {
  await delay();
  return MOCK_COUNTRY_REPORT;
}

export async function getValueReport(): Promise<ValueReport> {
  await delay();
  return MOCK_VALUE_REPORT;
}

export async function getPurchaseReport(): Promise<PurchaseReport> {
  await delay();
  return MOCK_PURCHASE_REPORT;
}

export async function getNotifications() {
  await delay(150);
  return MOCK_NOTIFICATIONS;
}
