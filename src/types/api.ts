/**
 * Core API types derived from مجموعه آثار ناصر صلب API OpenAPI 3.0.3
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
  /** Present when backend embeds user in login response; otherwise fetch via /me */
  user?: UserMe;
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

/** POST /api/users/ — create user (admin) */
export interface UserCreateRequest {
  username: string;
  password: string;
  /** Required by some backend serializers (DRF password confirmation) */
  password_confirm?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  /** If backend accepts roles on create */
  role_ids?: number[];
}

/** POST /api/users/invite/ — from OpenAPI */
export interface InviteLinkCreateRequest {
  username: string;
  password: string;
  password_confirm?: string;
  email?: string;
  role_ids?: number[];
  expires_in_hours?: number;
}

/** Response of POST /api/users/invite/ */
export interface InviteLinkCreateResponse {
  user?: User;
  invite_url: string;
  token: string;
  expires_at?: string;
  warning?: string;
}

/**
 * POST /api/users/invite/{token}/consume/
 * Backend returns JWT pair (same shape as login) when invite is accepted.
 * Body is empty unless OpenAPI documents extra fields.
 */
export type InviteConsumeResponse = TokenPairResponse;

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

// NOTE: Full domain types restored - medals, coins, banknotes, antiques
// See repo history for complete type definitions if needed.

export interface Medal {
  id: number;
  name: string;
  country?: string;
  year?: number | null;
  category?: number | null;
  category_detail?: Category;
  material?: string;
  quality?: Quality;
  authenticity?: Authenticity;
  catalog_number?: string;
  purchase_price?: string | null;
  purchase_currency?: Currency;
  current_value?: string | null;
  notes?: string;
  primary_image?: string;
  images_count?: string | number;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface MedalRequest {
  name: string;
  country?: string;
  year?: number | null;
  category?: number | null;
  material?: string;
  quality?: Quality;
  authenticity?: Authenticity;
  catalog_number?: string;
  purchase_price?: string | null;
  purchase_currency?: Currency;
  current_value?: string | null;
  notes?: string;
  [key: string]: unknown;
}

export interface MedalImage {
  id: number;
  image: string;
  image_url: string;
  image_type?: ImageType;
  caption?: string;
  ordering?: number;
  is_primary?: boolean;
  original_filename?: string;
  file_size?: number | null;
  uploaded_by?: number | null;
  uploaded_at?: string;
}

export interface MedalFile {
  id: number;
  file: string;
  file_url: string;
  file_type?: FileType;
  original_filename?: string;
  content_type?: string;
  file_size?: number | null;
  notes?: string;
  uploaded_by?: number | null;
  uploaded_at?: string;
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
  created_by?: number | null;
}

export interface MedalValuationRecord {
  id: number;
  value: string;
  currency?: Currency;
  valuation_date: string;
  source?: string;
  notes?: string;
  created_at: string;
  created_by?: number | null;
}

export interface MuseumMedal extends Medal {
  images?: MedalImage[];
  files?: MedalFile[];
  purchase_records?: MedalPurchaseRecord[];
  valuation_records?: MedalValuationRecord[];
}

export interface DashboardSummary {
  total_medals: number;
  countries: number;
  oldest_year: number | null;
  newest_year: number | null;
  value_by_currency: unknown[];
  medals_by_category: unknown[];
  medals_by_country_top: unknown[];
  [key: string]: unknown;
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

export type CoinItemType = "coin" | "banknote" | "token" | "bullion" | "other";

export interface Coin {
  id: number;
  name: string;
  item_type: CoinItemType;
  category_id?: number | null;
  country?: string;
  year?: number | null;
  quality?: Quality;
  authenticity?: Authenticity;
  purchase_price?: string | null;
  purchase_currency?: Currency;
  current_value?: string | null;
  is_active?: boolean;
  primary_image?: string | null;
  primary_image_url?: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface CoinRequest {
  name: string;
  item_type: CoinItemType;
  category_id?: number | null;
  country?: string;
  year?: number | null;
  quality?: Quality;
  authenticity?: Authenticity;
  purchase_price?: string | null;
  purchase_currency?: Currency;
  current_value?: string | null;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface CoinImage {
  id: number;
  image: string;
  image_url: string;
  image_type?: string;
  caption?: string;
  is_primary?: boolean;
  original_filename?: string;
  file_size?: number | null;
  uploaded_at?: string;
  [key: string]: unknown;
}

export interface CoinPurchaseRecord {
  id: number;
  purchase_date?: string | null;
  location?: string;
  seller?: string;
  price?: string | null;
  currency?: Currency;
  notes?: string;
  created_at: string;
  created_by?: number | null;
}

export interface CoinValuationRecord {
  id: number;
  value: string;
  currency?: Currency;
  valuation_date: string;
  source?: string;
  notes?: string;
  created_at: string;
  created_by?: number | null;
}

export interface Banknote {
  id: number;
  name: string;
  category_id?: number | null;
  country?: string;
  year?: number | null;
  quality?: Quality;
  authenticity?: Authenticity;
  is_active?: boolean;
  primary_image?: string | null;
  primary_image_url?: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface BanknoteRequest {
  name: string;
  category_id?: number | null;
  country?: string;
  year?: number | null;
  quality?: Quality;
  authenticity?: Authenticity;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface BanknoteImage {
  id: number;
  image: string;
  image_url: string;
  image_type?: string;
  is_primary?: boolean;
  [key: string]: unknown;
}

export interface BanknotePurchaseRecord {
  id: number;
  purchase_date?: string | null;
  location?: string;
  seller?: string;
  price?: string | null;
  currency?: Currency;
  notes?: string;
  created_at: string;
  created_by?: number | null;
}

export interface BanknoteValuationRecord {
  id: number;
  value: string;
  currency?: Currency;
  valuation_date: string;
  source?: string;
  notes?: string;
  created_at: string;
  created_by?: number | null;
}

export interface Antique {
  id: number;
  name: string;
  category_id?: number | null;
  country?: string;
  year?: number | null;
  quality?: Quality;
  authenticity?: Authenticity;
  is_active?: boolean;
  primary_image?: string | null;
  primary_image_url?: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface AntiqueRequest {
  name: string;
  category_id?: number | null;
  country?: string;
  year?: number | null;
  quality?: Quality;
  authenticity?: Authenticity;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface AntiqueImage {
  id: number;
  image: string;
  image_url: string;
  image_type?: string;
  is_primary?: boolean;
  [key: string]: unknown;
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
  created_by?: number | null;
}

export interface AntiqueValuationRecord {
  id: number;
  value: string;
  currency?: Currency;
  valuation_date: string;
  source?: string;
  notes?: string;
  created_at: string;
  created_by?: number | null;
}

// ---------- API Error shape ----------
export interface ApiErrorBody {
  detail?: string;
  [key: string]: unknown;
}
