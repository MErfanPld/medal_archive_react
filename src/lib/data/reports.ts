/**
 * Reports data layer — real API only.
 */

import type {
  DashboardSummary,
  CountryReport,
  ValueReport,
  PurchaseReport,
} from "@/types/api";
import { reportsApi, type PdfReportType } from "@/lib/api/reports";

export async function getDashboard(): Promise<DashboardSummary> {
  try {
    return await reportsApi.dashboard();
  } catch {
    return reportsApi.summary();
  }
}

export async function getCountryReport(
  limit?: number
): Promise<CountryReport> {
  return reportsApi.countries(limit);
}

export async function getValueReport(): Promise<ValueReport> {
  return reportsApi.value();
}

export async function getPurchaseReport(): Promise<PurchaseReport> {
  return reportsApi.purchases();
}

export async function downloadReportPdf(type: PdfReportType): Promise<Blob> {
  return reportsApi.downloadPdf(type);
}

/** Trigger browser download for a report PDF. */
export async function saveReportPdf(
  type: PdfReportType,
  filename?: string
): Promise<void> {
  const blob = await downloadReportPdf(type);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `report-${type}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
