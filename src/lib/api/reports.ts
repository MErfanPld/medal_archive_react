import { api } from "./client";
import type {
  DashboardSummary,
  CountryReport,
  ValueReport,
  PurchaseReport,
} from "@/types/api";

export type PdfReportType =
  | "summary"
  | "countries"
  | "valuation"
  | "purchases"
  | "inventory";

export const reportsApi = {
  dashboard: () => api.get<DashboardSummary>("/api/reports/dashboard/"),

  summary: () => api.get<DashboardSummary>("/api/reports/summary/"),

  countries: (limit?: number) =>
    api.get<CountryReport>(
      `/api/reports/countries/${limit ? `?limit=${limit}` : ""}`
    ),

  value: () => api.get<ValueReport>("/api/reports/value/"),

  purchases: () => api.get<PurchaseReport>("/api/reports/purchases/"),

  /**
   * Download PDF report. Returns a Blob.
   * type is required by the API.
   */
  downloadPdf: (type: PdfReportType) =>
    api.getBlob(`/api/reports/pdf/?type=${encodeURIComponent(type)}`),
};
