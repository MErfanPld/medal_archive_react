/**
 * Antique data layer — real API only.
 */
import type {
  Antique,
  AntiqueRequest,
  AntiqueImage,
  AntiquePurchaseRecord,
  AntiqueValuationRecord,
  PaginatedResponse,
} from "@/types/api";
import { antiquesApi, type AntiqueListParams } from "@/lib/api/antiques";

export type { AntiqueListParams };

export async function getAntiques(
  params?: AntiqueListParams
): Promise<PaginatedResponse<Antique>> {
  return antiquesApi.list(params);
}

export async function getAntiqueById(id: number): Promise<Antique> {
  return antiquesApi.retrieve(id);
}

export async function createAntique(data: AntiqueRequest): Promise<Antique> {
  return antiquesApi.create(data);
}

export async function updateAntique(
  id: number,
  data: AntiqueRequest
): Promise<Antique> {
  return antiquesApi.update(id, data);
}

export async function patchAntique(
  id: number,
  data: Partial<AntiqueRequest>
): Promise<Antique> {
  return antiquesApi.partialUpdate(id, data);
}

export async function deleteAntique(id: number): Promise<boolean> {
  await antiquesApi.destroy(id);
  return true;
}

export async function getAntiqueImages(
  itemPk: number,
  page?: number
): Promise<PaginatedResponse<AntiqueImage>> {
  return antiquesApi.listImages(itemPk, page);
}

export async function uploadAntiqueImage(
  itemPk: number,
  formData: FormData
): Promise<AntiqueImage> {
  return antiquesApi.createImage(itemPk, formData);
}

export async function deleteAntiqueImage(
  itemPk: number,
  id: number
): Promise<boolean> {
  await antiquesApi.destroyImage(itemPk, id);
  return true;
}

export async function getAntiquePurchases(
  antiqueId: number
): Promise<AntiquePurchaseRecord[]> {
  const res = await antiquesApi.listPurchases(antiqueId);
  return res.results ?? [];
}

export async function createAntiquePurchase(
  antiqueId: number,
  data: Partial<AntiquePurchaseRecord>
): Promise<AntiquePurchaseRecord> {
  return antiquesApi.createPurchase(antiqueId, data);
}

export async function deleteAntiquePurchase(
  antiqueId: number,
  purchaseId: number
): Promise<boolean> {
  try {
    await antiquesApi.destroyPurchase(antiqueId, purchaseId);
    return true;
  } catch {
    return false;
  }
}

export async function getAntiqueValuations(
  antiqueId: number
): Promise<AntiqueValuationRecord[]> {
  const res = await antiquesApi.listValuations(antiqueId);
  return res.results ?? [];
}

export async function createAntiqueValuation(
  antiqueId: number,
  data: Partial<AntiqueValuationRecord>
): Promise<AntiqueValuationRecord> {
  return antiquesApi.createValuation(antiqueId, data);
}

export async function deleteAntiqueValuation(
  antiqueId: number,
  valuationId: number
): Promise<boolean> {
  try {
    await antiquesApi.destroyValuation(antiqueId, valuationId);
    return true;
  } catch {
    return false;
  }
}
