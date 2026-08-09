/**
 * Core API types derived from Medal Archive API OpenAPI 3.0.3
 * Do not invent fields — only what the backend provides.
 */

// ---------- Pagination ----------
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------- Auth ----------
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LogoutRequest {
  refresh: string;
}

export interface TokenPairResponse {
  access: string;
  refresh: string;
  user: UserMe;
}

export interface MessageResponse {
  detail: string;
}

// ---------- User & RBAC ----------
export interface RoleMini {
  id: number;
  name: string;
  codename: string;
}

export interface Permission {
  id: number;
  codename: string;
  name: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  codename: string;
  description?: string;
  is_active?: boolean;
  permissions: Permission[];
}

export interface UserMe {
  id: number;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  roles: RoleMini[];
  is_active: boolean;
  must_change_password: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  first_name: string;
  last_name: string;
  roles: RoleMini[];
  is_active: boolean;
  is_locked: boolean;
  must_change_password: boolean;
  date_joined: string;
  last_login: string | null;
  last_login_ip: string | null;
}

export interface UserRoleAssignRequest {
  role_ids: number[];
}

export interface InviteLinkCreateRequest {
  username: string;
  password: string;
  email?: string;
  role_ids?: number[];
  expires_in_hours?: number;
}

export interface InviteLinkCreateResponse {
  user: User;
  invite_url: string;
  token: string;
  expires_at: string;
  warning: string;
}

// ---------- Category ----------
export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

// ---------- Medal enums ----------
export type Authenticity =
  | "authentic"
  | "suspect"
  | "counterfeit"
  | "unverified"
  | "unknown";

export type Quality =
  | "UNC"
  | "AU"
  | "XF"
  | "VF"
  | "F"
  | "VG"
  | "G"
  | "AG"
  | "FAIR"
  | "POOR"
  | "OTHER"
  | "";

export type Currency =
  | "IRR"
  | "USD"
  | "EUR"
  | "GBP"
  | "TRY"
  | "AED"
  | "OTHER"
  | "";

export type ImageType =
  | "front"
  | "back"
  | "edge"
  | "packaging"
  | "certificate"
  | "invoice"
  | "other";

export type FileType = "certificate" | "invoice" | "document" | "other";

// ---------- Medal ----------
export interface Medal {
  id: number;
  name: string;
  country?: string;
  year?: number | null;
  occasion?: string;
  historical_period?: string;
  maker?: string;
  mint_or_manufacturer?: string;
  category?: number | null;
  category_detail: Category;
  material?: string;
  weight?: string | null;
  diameter?: string | null;
  thickness?: string | null;
  shape?: string;
  color?: string;
  edge?: string;
  quality?: Quality;
  preservation_condition?: string;
  authenticity?: Authenticity;
  catalog_number?: string;
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
  primary_image: string;
  images_count: string;
  created_at: string;
  updated_at: string;
}

export interface MedalRequest {
  name: string;
  country?: string;
  year?: number | null;
  occasion?: string;
  historical_period?: string;
  maker?: string;
  mint_or_manufacturer?: string;
  category?: number | null;
  material?: string;
  weight?: string | null;
  diameter?: string | null;
  thickness?: string | null;
  shape?: string;
  color?: string;
  edge?: string;
  quality?: Quality;
  preservation_condition?: string;
  authenticity?: Authenticity;
  catalog_number?: string;
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
}

// ---------- Nested resources ----------
export interface MedalImage {
  id: number;
  image: string;
  image_url: string;
  image_type?: ImageType;
  caption?: string;
  ordering?: number;
  is_primary?: boolean;
  original_filename: string;
  file_size: number | null;
  uploaded_by: number | null;
  uploaded_at: string;
}

export interface MedalFile {
  id: number;
  file: string;
  file_url: string;
  file_type?: FileType;
  original_filename: string;
  content_type: string;
  file_size: number | null;
  notes?: string;
  uploaded_by: number | null;
  uploaded_at: string;
}

export interface MedalPurchaseRecord {
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

export interface MedalValuationRecord {
  id: number;
  value: string;
  currency?: Currency;
  valuation_date: string;
  source?: string;
  notes?: string;
  created_at: string;
  created_by: number | null;
}

// ---------- Museum (rich read-only) ----------
export interface MuseumMedal {
  id: number;
  name: string;
  country: string;
  year: number | null;
  occasion: string;
  historical_period: string;
  maker: string;
  mint_or_manufacturer: string;
  category: number | null;
  category_detail: Category;
  material: string;
  weight: string | null;
  diameter: string | null;
  thickness: string | null;
  shape: string;
  color: string;
  edge: string;
  quality: Quality;
  preservation_condition: string;
  authenticity: Authenticity;
  catalog_number: string;
  current_value: string | null;
  last_valuation_date: string | null;
  purchase_date: string | null;
  purchase_location: string;
  seller: string;
  purchase_price: string | null;
  purchase_currency: Currency;
  cabinet_number: string;
  drawer_number: string;
  box_number: string;
  notes: string;
  images: MedalImage[];
  files: MedalFile[];
  purchase_records: MedalPurchaseRecord[];
  valuation_records: MedalValuationRecord[];
  created_at: string;
  updated_at: string;
}

// ---------- Reports ----------
export interface DashboardSummary {
  total_medals: number;
  countries: number;
  oldest_year: number | null;
  newest_year: number | null;
  value_by_currency: unknown[];
  medals_by_category: unknown[];
  medals_by_country_top: unknown[];
}

export interface CountryReport {
  total_medals: number;
  items: unknown[];
}

export interface ValueReport {
  by_currency: unknown[];
  by_country: unknown[];
  by_category: unknown[];
  over_time: unknown[];
  note: string;
}

export interface PurchaseReport {
  purchase_count: number;
  by_year: unknown[];
  by_currency: unknown[];
  by_seller: unknown[];
  by_country: unknown[];
  note: string;
}

// ---------- API Error shape ----------
export interface ApiErrorBody {
  detail?: string;
  [key: string]: unknown;
}
