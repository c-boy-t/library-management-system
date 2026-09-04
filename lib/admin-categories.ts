import { z } from 'zod'

import { requestJson } from '@/lib/api'
import { categorySchema } from '@/lib/categories'

// --- Category Page types ---

const categoryPageSchema = z.object({
  total: z.number(),
  pages: z.number(),
  pageNum: z.number(),
  pageSize: z.number(),
  list: z.array(categorySchema),
})

export type CategoryPage = z.infer<typeof categoryPageSchema>

export interface AdminCategoryPageParams {
  page: number
  size: number
  categoryName?: string
  sort?: string
}

export interface CreateCategoryPayload {
  categoryName: string
  description?: string
  sortOrder?: number
}

export interface UpdateCategoryPayload {
  categoryName?: string
  description?: string
  sortOrder?: number
}

/**
 * 分页查询分类列表（管理员）。
 */
export async function fetchAdminCategories(params: AdminCategoryPageParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: params.sort ?? 'sortOrder,asc',
  })

  if (params.categoryName?.trim()) {
    search.set('categoryName', params.categoryName.trim())
  }

  return requestJson(`/api/v1/admin/categories?${search.toString()}`, {
    method: 'GET',
  }, categoryPageSchema)
}

export async function createAdminCategory(payload: CreateCategoryPayload) {
  return requestJson('/api/v1/admin/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, categorySchema)
}

export async function updateAdminCategory(categoryId: number, payload: UpdateCategoryPayload) {
  return requestJson(`/api/v1/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, categorySchema)
}

export async function deleteAdminCategory(categoryId: number) {
  return requestJson(`/api/v1/admin/categories/${categoryId}`, {
    method: 'DELETE',
  }, z.void())
}
