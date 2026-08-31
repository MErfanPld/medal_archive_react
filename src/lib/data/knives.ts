/**
 * Knife data layer — real API only.
 */
import type { PaginatedResponse } from "@/types/api";
import type {
  Knife,
  KnifeRequest,
  KnifeImage,
  KnifePurchaseRecord,
  KnifeValuationRecord,
} from "@/types/knives";
import { knivesApi, type KnifeListParams } from "@/lib/api/knives";

export type { KnifeListParams };

export async function getKnives(
  params?: KnifeListParams
): Promise<PaginatedResponse<Knife>> {
  return knivesApi.list(params);
}

export async function getKnifeById(id: number): Promise<Knife> {
  return knivesApi.retrieve(id);
}

export async function createKnife(data: KnifeRequest): Promise<Knife> {
  return knivesApi.create(data);
}

export async function updateKnife(
  id: number,
  data: KnifeRequest
): Promise<Knife> {
  return knivesApi.update(id, data);
}

export async function patchKnife(
  id: number,
  data: Partial<KnifeRequest>
): Promise<Knife> {
  return knivesApi.partialUpdate(id, data);
}

export async function deleteKnife(id: number): Promise<boolean> {
  await knivesApi.destroy(id);
  return true;
}

export async function getKnifeImages(
  itemPk: number,
  page?: number
): Promise<PaginatedResponse<KnifeImage>> {
  return knivesApi.listImages(itemPk, page);
}

export async function uploadKnifeImage(
  itemPk: number,
  formData: FormData
): Promise<KnifeImage> {
  return knivesApi.createImage(itemPk, formData);
}

export async function deleteKnifeImage(
  itemPk: number,
  id: number
): Promise<boolean> {
  await knivesApi.destroyImage(itemPk, id);
  return true;
}

export async function getKnifePurchases(
  knifeId: number
): Promise<KnifePurchaseRecord[]> {
  const res = await knivesApi.listPurchases(knifeId);
  return res.results ?? [];
}

export async function createKnifePurchase(
  knifeId: number,
  data: Partial<KnifePurchaseRecord>
): Promise<KnifePurchaseRecord> {
  return knivesApi.createPurchase(knifeId, data);
}

export async function deleteKnifePurchase(
  knifeId: number,
  purchaseId: number
): Promise<boolean> {
  try {
    await knivesApi.destroyPurchase(knifeId, purchaseId);
    return true;
  } catch {
    return false;
  }
}

export async function getKnifeValuations(
  knifeId: number
): Promise<KnifeValuationRecord[]> {
  const res = await knivesApi.listValuations(knifeId);
  return res.results ?? [];
}

export async function createKnifeValuation(
  knifeId: number,
  data: Partial<KnifeValuationRecord>
): Promise<KnifeValuationRecord> {
  return knivesApi.createValuation(knifeId, data);
}

export async function deleteKnifeValuation(
  knifeId: number,
  valuationId: number
): Promise<boolean> {
  try {
    await knivesApi.destroyValuation(knifeId, valuationId);
    return true;
  } catch {
    return false;
  }
}
