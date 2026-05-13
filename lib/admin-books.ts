import { z } from 'zod'

import { buildAuthHeaders, requestJson } from '@/lib/api'

const nullableNumberSchema = z.union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === '') {
      return undefined
    }

    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  })

export const bookListItemSchema = z.object({
  bookId: z.number(),
  isbn: z.string(),
  title: z.string(),
  author: z.string(),
  publisher: z.string().optional().nullable(),
  publishYear: z.number().optional().nullable(),
  categoryId: z.number().optional().nullable(),
  categoryName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalCount: z.number(),
  availableCount: z.number(),
  coverUrl: z.string().optional().nullable(),
  createTime: z.string().optional().nullable(),
})

export const bookDetailSchema = z.object({
  bookId: z.number(),
  isbn: z.string(),
  title: z.string(),
  author: z.string(),
  publisher: z.string().optional().nullable(),
  publishYear: z.number().optional().nullable(),
  categoryId: z.number(),
  categoryName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  totalCount: z.number(),
  availableCount: z.number(),
  coverUrl: z.string().optional().nullable(),
  createTime: z.string().optional().nullable(),
  updateTime: z.string().optional().nullable(),
})

export const bookPageSchema = z.object({
  total: z.number(),
  pages: z.number(),
  pageNum: z.number(),
  pageSize: z.number(),
  list: z.array(bookListItemSchema),
})

export type BookListItem = z.infer<typeof bookListItemSchema>
export type BookDetail = z.infer<typeof bookDetailSchema>
export type BookPage = z.infer<typeof bookPageSchema>

export interface FetchAdminBooksParams {
  page: number
  size: number
  title?: string
  author?: string
  categoryId?: number
}

export interface BookUpsertPayload {
  isbn: string
  title: string
  author: string
  publisher?: string
  publishYear?: number
  categoryId: number
  description?: string
  totalCount: number
  coverUrl?: string
}

export async function fetchAdminBooks(token: string, params: FetchAdminBooksParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: 'createTime,desc',
  })

  if (params.title?.trim()) {
    search.set('title', params.title.trim())
  }

  if (params.author?.trim()) {
    search.set('author', params.author.trim())
  }

  if (params.categoryId !== undefined) {
    search.set('categoryId', String(params.categoryId))
  }

  return requestJson(`/api/v1/books?${search.toString()}`, {
    method: 'GET',
    headers: buildAuthHeaders(token, false),
  }, bookPageSchema)
}

export async function fetchBookDetail(token: string, bookId: number) {
  return requestJson(`/api/v1/books/${bookId}`, {
    method: 'GET',
    headers: buildAuthHeaders(token, false),
  }, bookDetailSchema)
}

export async function createAdminBook(token: string, payload: BookUpsertPayload) {
  return requestJson('/api/v1/admin/books', {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({
      ...payload,
      publishYear: nullableNumberSchema.parse(payload.publishYear),
      categoryId: payload.categoryId,
      totalCount: payload.totalCount,
    }),
  }, bookDetailSchema)
}

export async function updateAdminBook(token: string, bookId: number, payload: BookUpsertPayload) {
  return requestJson(`/api/v1/admin/books/${bookId}`, {
    method: 'PUT',
    headers: buildAuthHeaders(token),
    body: JSON.stringify({
      ...payload,
      publishYear: nullableNumberSchema.parse(payload.publishYear),
      categoryId: payload.categoryId,
      totalCount: payload.totalCount,
    }),
  }, bookDetailSchema)
}

export async function deleteAdminBook(token: string, bookId: number) {
  return requestJson(`/api/v1/admin/books/${bookId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token, false),
  }, z.void())
}
