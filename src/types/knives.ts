/** Knife domain types — /api/knives/ */
import type { Category, Quality, Authenticity, Currency } from "@/types/api";

export interface Knife {
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
  blade_length?: string | null;
  handle_material?: string;
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

export interface KnifeRequest {
  name: string;
  category_id?: number | null;
  country?: string;
  year?: number | null;
  year_hijri?: number | null;
  historical_period?: string;
  origin?: string;
  style?: string;
  material?: string;
  blade_length?: string | null;
  handle_material?: string;
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

export interface KnifeImage {
  id: number;
  knife?: number;
  image?: string;
  image_url?: string | null;
  image_type?: string;
  is_primary?: boolean;
  caption?: string;
  order?: number;
  created_at?: string;
}

export interface KnifePurchaseRecord {
  id: number;
  knife?: number;
  purchase_date?: string | null;
  purchase_location?: string;
  seller?: string;
  price?: string | null;
  currency?: Currency;
  notes?: string;
  created_at?: string;
}

export interface KnifeValuationRecord {
  id: number;
  knife?: number;
  valuation_date?: string | null;
  value?: string | null;
  currency?: Currency;
  valuator?: string;
  notes?: string;
  created_at?: string;
}
