/**
 * Stamp data layer — real API only.
 */
import type { PaginatedResponse } from "@/types/api";
import type {
  Stamp,
  StampRequest,
  StampImage,
  StampPurchaseRecord,
  StampValuationRecord,
} from "@/types/stamps";
import { stampsApi, type StampListParams } from "@/lib/api/stamps";

export type { StampListParams };

export async function getStamps(
  params?: StampListParams
): Promise<PaginatedResponse<Stamp>> {
  return stampsApi.list(params);
}

export async function getStampById(id: number): Promise<Stamp> {
  return stampsApi.retrieve(id);
}

export async function createStamp(data: StampRequest): Promise<Stamp> {
  return stampsApi.create(data);
}

export async function updateStamp(
  id: number,
  data: StampRequest
): Promise<Stamp> {
  return stampsApi.update(id, data);
}

export async function patchStamp(
  id: number,
  data: Partial<StampRequest>
): Promise<Stamp> {
  return stampsApi.partialUpdate(id, data);
}

export async function deleteStamp(id: number): Promise<boolean> {
  await stampsApi.destroy(id);
  return true;
}

export async function getStampImages(
  itemPk: number,
  page?: number
): Promise<PaginatedResponse<StampImage>> {
  return stampsApi.listImages(itemPk, page);
}

export async function uploadStampImage(
  itemPk: number,
  formData: FormData
): Promise<StampImage> {
  return stampsApi.createImage(itemPk, formData);
}

export async function deleteStampImage(
  itemPk: number,
  id: number
): Promise<boolean> {
  await stampsApi.destroyImage(itemPk, id);
  return true;
}

export async function getStampPurchases(
  stampId: number
): Promise<StampPurchaseRecord[]> {
  const res = await stampsApi.listPurchases(stampId);
  return res.results ?? [];
}

export async function createStampPurchase(
  stampId: number,
  data: Partial<StampPurchaseRecord>
): Promise<StampPurchaseRecord> {
  return stampsApi.createPurchase(stampId, data);
}

export async function deleteStampPurchase(
  stampId: number,
  purchaseId: number
): Promise<boolean> {
  try {
    await stampsApi.destroyPurchase(stampId, purchaseId);
    return true;
  } catch {
    return false;
  }
}

export async function getStampValuations(
  stampId: number
): Promise<StampValuationRecord[]> {
  const res = await stampsApi.listValuations(stampId);
  return res.results ?? [];
}

export async function createStampValuation(
  stampId: number,
  data: Partial<StampValuationRecord>
): Promise<StampValuationRecord> {
  return stampsApi.createValuation(stampId, data);
}

export async function deleteStampValuation(
  stampId: number,
  valuationId: number
): Promise<boolean> {
  try {
    await stampsApi.destroyValuation(stampId, valuationId);
    return true;
  } catch {
    return false;
  }
}
