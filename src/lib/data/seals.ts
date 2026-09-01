/**
 * Seal data layer — real API only.
 */
import type { PaginatedResponse } from "@/types/api";
import type {
  Seal,
  SealRequest,
  SealImage,
  SealPurchaseRecord,
  SealValuationRecord,
} from "@/types/seals";
import { sealsApi, type SealListParams } from "@/lib/api/seals";

export type { SealListParams };

export async function getSeals(
  params?: SealListParams
): Promise<PaginatedResponse<Seal>> {
  return sealsApi.list(params);
}

export async function getSealById(id: number): Promise<Seal> {
  return sealsApi.retrieve(id);
}

export async function createSeal(data: SealRequest): Promise<Seal> {
  return sealsApi.create(data);
}

export async function updateSeal(
  id: number,
  data: SealRequest
): Promise<Seal> {
  return sealsApi.update(id, data);
}

export async function patchSeal(
  id: number,
  data: Partial<SealRequest>
): Promise<Seal> {
  return sealsApi.partialUpdate(id, data);
}

export async function deleteSeal(id: number): Promise<boolean> {
  await sealsApi.destroy(id);
  return true;
}

export async function getSealImages(
  itemPk: number,
  page?: number
): Promise<PaginatedResponse<SealImage>> {
  return sealsApi.listImages(itemPk, page);
}

export async function uploadSealImage(
  itemPk: number,
  formData: FormData
): Promise<SealImage> {
  return sealsApi.createImage(itemPk, formData);
}

export async function deleteSealImage(
  itemPk: number,
  id: number
): Promise<boolean> {
  await sealsApi.destroyImage(itemPk, id);
  return true;
}

export async function getSealPurchases(
  sealId: number
): Promise<SealPurchaseRecord[]> {
  const res = await sealsApi.listPurchases(sealId);
  return res.results ?? [];
}

export async function createSealPurchase(
  sealId: number,
  data: Partial<SealPurchaseRecord>
): Promise<SealPurchaseRecord> {
  return sealsApi.createPurchase(sealId, data);
}

export async function deleteSealPurchase(
  sealId: number,
  purchaseId: number
): Promise<boolean> {
  try {
    await sealsApi.destroyPurchase(sealId, purchaseId);
    return true;
  } catch {
    return false;
  }
}

export async function getSealValuations(
  sealId: number
): Promise<SealValuationRecord[]> {
  const res = await sealsApi.listValuations(sealId);
  return res.results ?? [];
}

export async function createSealValuation(
  sealId: number,
  data: Partial<SealValuationRecord>
): Promise<SealValuationRecord> {
  return sealsApi.createValuation(sealId, data);
}

export async function deleteSealValuation(
  sealId: number,
  valuationId: number
): Promise<boolean> {
  try {
    await sealsApi.destroyValuation(sealId, valuationId);
    return true;
  } catch {
    return false;
  }
}
