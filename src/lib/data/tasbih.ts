/**
 * Tasbih data layer — real API only.
 */
import type { PaginatedResponse } from "@/types/api";
import type {
  Tasbih,
  TasbihRequest,
  TasbihImage,
  TasbihPurchaseRecord,
  TasbihValuationRecord,
} from "@/types/tasbih";
import { tasbihApi, type TasbihListParams } from "@/lib/api/tasbih";

export type { TasbihListParams };

export async function getTasbihs(
  params?: TasbihListParams
): Promise<PaginatedResponse<Tasbih>> {
  return tasbihApi.list(params);
}

export async function getTasbihById(id: number): Promise<Tasbih> {
  return tasbihApi.retrieve(id);
}

export async function createTasbih(data: TasbihRequest): Promise<Tasbih> {
  return tasbihApi.create(data);
}

export async function updateTasbih(
  id: number,
  data: TasbihRequest
): Promise<Tasbih> {
  return tasbihApi.update(id, data);
}

export async function patchTasbih(
  id: number,
  data: Partial<TasbihRequest>
): Promise<Tasbih> {
  return tasbihApi.partialUpdate(id, data);
}

export async function deleteTasbih(id: number): Promise<boolean> {
  await tasbihApi.destroy(id);
  return true;
}

export async function getTasbihImages(
  itemPk: number,
  page?: number
): Promise<PaginatedResponse<TasbihImage>> {
  return tasbihApi.listImages(itemPk, page);
}

export async function uploadTasbihImage(
  itemPk: number,
  formData: FormData
): Promise<TasbihImage> {
  return tasbihApi.createImage(itemPk, formData);
}

export async function deleteTasbihImage(
  itemPk: number,
  id: number
): Promise<boolean> {
  await tasbihApi.destroyImage(itemPk, id);
  return true;
}

export async function getTasbihPurchases(
  tasbihId: number
): Promise<TasbihPurchaseRecord[]> {
  const res = await tasbihApi.listPurchases(tasbihId);
  return res.results ?? [];
}

export async function createTasbihPurchase(
  tasbihId: number,
  data: Partial<TasbihPurchaseRecord>
): Promise<TasbihPurchaseRecord> {
  return tasbihApi.createPurchase(tasbihId, data);
}

export async function deleteTasbihPurchase(
  tasbihId: number,
  purchaseId: number
): Promise<boolean> {
  try {
    await tasbihApi.destroyPurchase(tasbihId, purchaseId);
    return true;
  } catch {
    return false;
  }
}

export async function getTasbihValuations(
  tasbihId: number
): Promise<TasbihValuationRecord[]> {
  const res = await tasbihApi.listValuations(tasbihId);
  return res.results ?? [];
}

export async function createTasbihValuation(
  tasbihId: number,
  data: Partial<TasbihValuationRecord>
): Promise<TasbihValuationRecord> {
  return tasbihApi.createValuation(tasbihId, data);
}

export async function deleteTasbihValuation(
  tasbihId: number,
  valuationId: number
): Promise<boolean> {
  try {
    await tasbihApi.destroyValuation(tasbihId, valuationId);
    return true;
  } catch {
    return false;
  }
}
