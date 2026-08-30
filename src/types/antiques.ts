/** Antique domain types — /api/antiques/ */
import type { Category, Quality, Authenticity, Currency } from "@/types/api";

export interface Antique {
  id: number;
  name: string;
  category_id?: number | null;
  category_name?: string;
  category_detail?: Category | null;
  country?: string;
  year?: number | null;
  year_hijri?: number | null;
  historical_period?: string;
  origin?: string;
  style?: string;
  material?: string;
  dimensions?: string;
  weight?: string | null;
  maker?: string;
  catalog_number?: string;
  quality?: Quality;
  quality_display?: string;
  preservation_condition?: string;
  authenticity?: Authenticity;
  authenticity_display?: string;
  purchase_date?: string | null;
  purchase_location?: string;
  seller?: string;
  purchase_price?: string | null;
  purchase_currency?: Currency;
  current_value?: string | null;
  last_valuation_date?: string | null;
  cabinet_number?: string;
  drawer_number?: string;
  box_number?: string;
  notes?: string;
  is_active?: boolean;
  primary_image?: string | null;
  primary_image_url?: string | null;
  images_count?: string | number;
  created_at: string;
  updated_at?: string;
}

export interface AntiqueRequest {
  name: string;
  category_id?: number | null;
  country?: string;
  year?: number | null;
  year_hijri?: number | null;
  historical_period?: string;
  origin?: string;
  style?: string;
  material?: string;
  dimensions?: string;
  weight?: string | null;
  maker?: string;
  catalog_number?: string;
  quality?: Quality;
  preservation_condition?: string;
  authenticity?: Authenticity;
  purchase_date?: string | null;
  purchase_location?: string;
  seller?: string;
  purchase_price?: string | null;
  purchase_currency?: Currency;
  current_value?: string | null;
  last_valuation_date?: string | null;
  cabinet_number?: string;
  drawer_number?: string;
  box_number?: string;
  notes?: string;
  is_active?: boolean;
}

export type AntiqueImageType =
  | "front"
  | "back"
  | "detail"
  | "certificate"
  | "other";

export interface AntiqueImage {
  id: number;
  image: string;
  image_url: string;
  image_type?: AntiqueImageType;
  caption?: string;
  ordering?: number;
  is_primary?: boolean;
  original_filename: string;
  file_size: number | null;
  uploaded_by: number | null;
  uploaded_at: string;
}

export interface AntiquePurchaseRecord {
  id: number;
  purchase_date?: string | null;
  location?: string;
  seller?: string;
  price?: string | null;
  currency?: Currency;
  notes?: string;
  created_at: string;
  created_by: number | null;
}

export interface AntiqueValuationRecord {
  id: number;
  value: string;
  currency?: Currency;
  valuation_date: string;
  source?: string;
  notes?: string;
  created_at: string;
  created_by: number | null;
}
