/**
 * Coins data layer — real API only.
 */

import type {
  Coin,
  CoinRequest,
  CoinImage,
  CoinPurchaseRecord,
  CoinValuationRecord,
  PaginatedResponse,
} from "@/types/api";
import { coinsApi, type CoinListParams } from "@/lib/api/coins";

export type { CoinListParams };

export async function getCoins(
  params?: CoinListParams
): Promise<PaginatedResponse<Coin>> {
  return coinsApi.list(params);
}

export async function getCoinById(id: number): Promise<Coin> {
  return coinsApi.retrieve(id);
}

export async function createCoin(data: CoinRequest): Promise<Coin> {
  return coinsApi.create(data);
}

export async function updateCoin(
  id: number,
  data: CoinRequest
): Promise<Coin> {
  return coinsApi.update(id, data);
}

export async function patchCoin(
  id: number,
  data: Partial<CoinRequest>
): Promise<Coin> {
  return coinsApi.partialUpdate(id, data);
}

export async function deleteCoin(id: number): Promise<boolean> {
  await coinsApi.destroy(id);
  return true;
}

export async function getCoinImages(
  coinPk: number,
  page?: number
): Promise<PaginatedResponse<CoinImage>> {
  return coinsApi.listImages(coinPk, page);
}

export async function uploadCoinImage(
  coinPk: number,
  formData: FormData
): Promise<CoinImage> {
  return coinsApi.createImage(coinPk, formData);
}

export async function deleteCoinImage(
  coinPk: number,
  id: number
): Promise<boolean> {
  await coinsApi.destroyImage(coinPk, id);
  return true;
}

export async function getCoinPurchases(
  coinId: number
): Promise<CoinPurchaseRecord[]> {
  const res = await coinsApi.listPurchases(coinId);
  return res.results ?? [];
}

export async function createCoinPurchase(
  coinId: number,
  data: Partial<CoinPurchaseRecord>
): Promise<CoinPurchaseRecord> {
  return coinsApi.createPurchase(coinId, data);
}

export async function deleteCoinPurchase(
  coinId: number,
  purchaseId: number
): Promise<boolean> {
  try {
    await coinsApi.destroyPurchase(coinId, purchaseId);
    return true;
  } catch {
    return false;
  }
}

export async function getCoinValuations(
  coinId: number
): Promise<CoinValuationRecord[]> {
  const res = await coinsApi.listValuations(coinId);
  return res.results ?? [];
}

export async function createCoinValuation(
  coinId: number,
  data: Partial<CoinValuationRecord>
): Promise<CoinValuationRecord> {
  return coinsApi.createValuation(coinId, data);
}

export async function deleteCoinValuation(
  coinId: number,
  valuationId: number
): Promise<boolean> {
  try {
    await coinsApi.destroyValuation(coinId, valuationId);
    return true;
  } catch {
    return false;
  }
}
