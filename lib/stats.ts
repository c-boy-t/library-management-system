import { z } from 'zod'

import { requestJson } from '@/lib/api'

export const publicStatsSchema = z.object({
  bookTotal: z.number(),
  userTotal: z.number(),
  totalBorrowCount: z.number(),
  categoryTotal: z.number(),
})

export type PublicStats = z.infer<typeof publicStatsSchema>

export const hotBookSchema = z.object({
  bookId: z.number(),
  title: z.string(),
  author: z.string(),
  categoryId: z.number().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  borrowCount: z.number(),
})

export type HotBook = z.infer<typeof hotBookSchema>

/**
 * 获取公开统计概览（匿名可访问）。
 */
export async function fetchPublicStatsOverview() {
  return requestJson('/api/v1/stats/overview', {
    method: 'GET',
  }, publicStatsSchema)
}

/**
 * 获取热门图书（按累计借阅次数排序，匿名可访问）。
 */
export async function fetchHotBooks(limit: number) {
  return requestJson(`/api/v1/stats/hot-books?limit=${limit}`, {
    method: 'GET',
  }, z.array(hotBookSchema))
}
