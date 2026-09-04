import { z } from 'zod'

import { requestJson } from '@/lib/api'

const statisticsOverviewSchema = z.object({
  bookTotal: z.number(),
  categoryTotal: z.number(),
  userTotal: z.number(),
  activeUserTotal: z.number(),
  activeBorrowingTotal: z.number(),
  overdueBorrowingTotal: z.number(),
  todayBorrowCount: z.number(),
  monthBorrowCount: z.number(),
  totalBorrowCount: z.number(),
  totalFineAmount: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  availableBookTotal: z.number(),
  monthNewUserCount: z.number(),
})

const borrowingTrendSchema = z.object({
  date: z.string(),
  borrowCount: z.number(),
})

const hotBookSchema = z.object({
  bookId: z.number(),
  title: z.string(),
  author: z.string(),
  categoryId: z.number().optional().nullable(),
  categoryName: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  borrowCount: z.number(),
})

const categoryDistributionSchema = z.object({
  categoryId: z.number(),
  categoryName: z.string(),
  bookCount: z.number(),
})

export type StatisticsOverview = z.infer<typeof statisticsOverviewSchema>
export type BorrowingTrend = z.infer<typeof borrowingTrendSchema>
export type HotBook = z.infer<typeof hotBookSchema>
export type CategoryDistribution = z.infer<typeof categoryDistributionSchema>

export async function fetchAdminStatisticsOverview() {
  return requestJson('/api/v1/admin/statistics/overview', {
    method: 'GET',
  }, statisticsOverviewSchema)
}

export async function fetchAdminBorrowingTrend(days = 30) {
  return requestJson(`/api/v1/admin/statistics/borrowing-trend?days=${days}`, {
    method: 'GET',
  }, z.array(borrowingTrendSchema))
}

export async function fetchAdminHotBooks(limit = 10) {
  return requestJson(`/api/v1/admin/statistics/hot-books?limit=${limit}`, {
    method: 'GET',
  }, z.array(hotBookSchema))
}

export async function fetchAdminCategoryDistribution() {
  return requestJson('/api/v1/admin/statistics/category-distribution', {
    method: 'GET',
  }, z.array(categoryDistributionSchema))
}
