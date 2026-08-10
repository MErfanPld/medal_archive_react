import type { Category, CategoryRequest, PaginatedResponse } from "@/types/api";
import { MOCK_CATEGORIES } from "@/data/mock/categories";

let store: Category[] = [...MOCK_CATEGORIES];
let nextId = Math.max(...MOCK_CATEGORIES.map((c) => c.id)) + 1;

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
}

export interface CategoryListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

export async function getCategories(
  params?: CategoryListParams
): Promise<PaginatedResponse<Category>> {
  await delay();
  let list = [...store];
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }
  if (params?.is_active != null) {
    list = list.filter((c) => c.is_active === params.is_active);
  }
  if (params?.ordering) {
    const desc = params.ordering.startsWith("-");
    const field = (desc ? params.ordering.slice(1) : params.ordering) as keyof Category;
    list.sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av == null || bv == null) return 0;
      if (av < bv) return desc ? 1 : -1;
      if (av > bv) return desc ? -1 : 1;
      return 0;
    });
  }
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  return {
    count: list.length,
    next: start + pageSize < list.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results: list.slice(start, start + pageSize),
  };
}

export async function getCategoryById(id: number): Promise<Category | null> {
  await delay();
  return store.find((c) => c.id === id) ?? null;
}

export async function createCategory(data: CategoryRequest): Promise<Category> {
  await delay(350);
  const cat: Category = {
    id: nextId++,
    name: data.name,
    slug: data.slug || data.name.replace(/\s+/g, "-").toLowerCase(),
    description: data.description,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store = [cat, ...store];
  return cat;
}

export async function updateCategory(
  id: number,
  data: Partial<CategoryRequest>
): Promise<Category | null> {
  await delay(350);
  const idx = store.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  store[idx] = {
    ...store[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  return store[idx];
}

export async function deleteCategory(id: number): Promise<boolean> {
  await delay(300);
  const before = store.length;
  store = store.filter((c) => c.id !== id);
  return store.length < before;
}
