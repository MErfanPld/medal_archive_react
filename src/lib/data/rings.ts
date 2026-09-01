/**
 * Ring data layer — real API only.
 */
import type { PaginatedResponse } from "@/types/api";
import type {
  Ring,
  RingRequest,
  RingImage,
  RingPurchaseRecord,
  RingValuationRecord,
} from "@/types/rings";
import { ringsApi, type RingListParams } from "@/lib/api/rings";

export type { RingListParams };

export async function getRings(
  params?: RingListParams
): Promise<PaginatedResponse<Ring>> {
  return ringsApi.list(params);
}

export async function getRingById(id: number): Promise<Ring> {
  return ringsApi.retrieve(id);
}

export async function createRing(data: RingRequest): Promise<Ring> {
  return ringsApi.create(data);
}

export async function updateRing(
  id: number,
  data: RingRequest
): Promise<Ring> {
  return ringsApi.update(id, data);
}

export async function patchRing(
  id: number,
  data: Partial<RingRequest>
): Promise<Ring> {
  return ringsApi.partialUpdate(id, data);
}

export async function deleteRing(id: number): Promise<boolean> {
  await ringsApi.destroy(id);
  return true;
}

export async function getRingImages(
  itemPk: number,
  page?: number
): Promise<PaginatedResponse<RingImage>> {
  return ringsApi.listImages(itemPk, page);
}

export async function uploadRingImage(
  itemPk: number,
  formData: FormData
): Promise<RingImage> {
  return ringsApi.createImage(itemPk, formData);
}

export async function deleteRingImage(
  itemPk: number,
  id: number
): Promise<boolean> {
  await ringsApi.destroyImage(itemPk, id);
  return true;
}

export async function getRingPurchases(
  ringId: number
): Promise<RingPurchaseRecord[]> {
  const res = await ringsApi.listPurchases(ringId);
  return res.results ?? [];
}

export async function createRingPurchase(
  ringId: number,
  data: Partial<RingPurchaseRecord>
): Promise<RingPurchaseRecord> {
  return ringsApi.createPurchase(ringId, data);
}

export async function deleteRingPurchase(
  ringId: number,
  purchaseId: number
): Promise<boolean> {
  try {
    await ringsApi.destroyPurchase(ringId, purchaseId);
    return true;
  } catch {
    return false;
  }
}

export async function getRingValuations(
  ringId: number
): Promise<RingValuationRecord[]> {
  const res = await ringsApi.listValuations(ringId);
  return res.results ?? [];
}

export async function createRingValuation(
  ringId: number,
  data: Partial<RingValuationRecord>
): Promise<RingValuationRecord> {
  return ringsApi.createValuation(ringId, data);
}

export async function deleteRingValuation(
  ringId: number,
  valuationId: number
): Promise<boolean> {
  try {
    await ringsApi.destroyValuation(ringId, valuationId);
    return true;
  } catch {
    return false;
  }
}
