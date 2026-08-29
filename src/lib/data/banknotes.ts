/**
 * Banknotes data layer — real API only.
 */

import type {
  Banknote,
  BanknoteRequest,
  BanknoteImage,
  BanknotePurchaseRecord,
  BanknoteValuationRecord,
  PaginatedResponse,
} from "@/types/api";
import { banknotesApi, type BanknoteListParams } from "@/lib/api/banknotes";

export type { BanknoteListParams };

export async function getBanknotes(
  params?: BanknoteListParams
): Promise<PaginatedResponse<Banknote>> {
  return banknotesApi.list(params);
}

export async function getBanknoteById(id: number): Promise<Banknote> {
  return banknotesApi.retrieve(id);
}

export async function createBanknote(data: BanknoteRequest): Promise<Banknote> {
  return banknotesApi.create(data);
}

export async function updateBanknote(
  id: number,
  data: BanknoteRequest
): Promise<Banknote> {
  return banknotesApi.update(id, data);
}

export async function patchBanknote(
  id: number,
  data: Partial<BanknoteRequest>
): Promise<Banknote> {
  return banknotesApi.partialUpdate(id, data);
}

export async function deleteBanknote(id: number): Promise<boolean> {
  await banknotesApi.destroy(id);
  return true;
}

export async function getBanknoteImages(
  itemPk: number,
  page?: number
): Promise<PaginatedResponse<BanknoteImage>> {
  return banknotesApi.listImages(itemPk, page);
}

export async function uploadBanknoteImage(
  itemPk: number,
  formData: FormData
): Promise<BanknoteImage> {
  return banknotesApi.createImage(itemPk, formData);
}

export async function deleteBanknoteImage(
  itemPk: number,
  id: number
): Promise<boolean> {
  await banknotesApi.destroyImage(itemPk, id);
  return true;
}

export async function getBanknotePurchases(
  banknoteId: number
): Promise<BanknotePurchaseRecord[]> {
  const res = await banknotesApi.listPurchases(banknoteId);
  return res.results ?? [];
}

export async function createBanknotePurchase(
  banknoteId: number,
  data: Partial<BanknotePurchaseRecord>
): Promise<BanknotePurchaseRecord> {
  return banknotesApi.createPurchase(banknoteId, data);
}

export async function deleteBanknotePurchase(
  banknoteId: number,
  purchaseId: number
): Promise<boolean> {
  try {
    await banknotesApi.destroyPurchase(banknoteId, purchaseId);
    return true;
  } catch {
    return false;
  }
}

export async function getBanknoteValuations(
  banknoteId: number
): Promise<BanknoteValuationRecord[]> {
  const res = await banknotesApi.listValuations(banknoteId);
  return res.results ?? [];
}

export async function createBanknoteValuation(
  banknoteId: number,
  data: Partial<BanknoteValuationRecord>
): Promise<BanknoteValuationRecord> {
  return banknotesApi.createValuation(banknoteId, data);
}

export async function deleteBanknoteValuation(
  banknoteId: number,
  valuationId: number
): Promise<boolean> {
  try {
    await banknotesApi.destroyValuation(banknoteId, valuationId);
    return true;
  } catch {
    return false;
  }
}
