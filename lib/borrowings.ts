import { z } from 'zod'

import { buildAuthHeaders, requestJson } from '@/lib/api'

const numericAmountSchema = z.union([z.number(), z.string()]).transform((value) => Number(value) || 0)

export const borrowingRecordSchema = z.object({
  borrowId: z.number(),
  userId: z.number(),
  username: z.string().optional().nullable(),
  realName: z.string().optional().nullable(),
  bookId: z.number(),
  bookTitle: z.string(),
  author: z.string(),
  coverUrl: z.string().optional().nullable(),
  borrowDate: z.string(),
  dueDate: z.string(),
  returnDate: z.string().optional().nullable(),
  status: z.string(),
  overdueFine: numericAmountSchema,
  renewed: z.number().optional().nullable(),
  renewalCount: z.number().optional().nullable(),
  remark: z.string().optional().nullable(),
  createTime: z.string().optional().nullable(),
  updateTime: z.string().optional().nullable(),
})

export const borrowingSummarySchema = z.object({
  currentBorrowingCount: z.number(),
  dueSoonCount: z.number(),
  overdueBookCount: z.number(),
  overdueFineAll: numericAmountSchema,
  historyBorrowingCount: z.number(),
})

const borrowingPageSchema = z.object({
  total: z.number(),
  pages: z.number(),
  pageNum: z.number(),
  pageSize: z.number(),
  list: z.array(borrowingRecordSchema),
})

export type BorrowingRecord = z.infer<typeof borrowingRecordSchema>
export type BorrowingSummary = z.infer<typeof borrowingSummarySchema>
export type BorrowingPage = z.infer<typeof borrowingPageSchema>

/**
 * 获取当前用户借阅统计概览。
 *
 * @param token 访问令牌
 * @returns 借阅统计概览
 */
export async function fetchMyBorrowingSummary(token: string) {
  return requestJson('/api/v1/borrowings/me/summary', {
    method: 'GET',
    headers: buildAuthHeaders(token, false),
  }, borrowingSummarySchema)
}

/**
 * 获取当前用户借阅列表。
 *
 * @param token 访问令牌
 * @returns 当前借阅分页结果
 */
export async function fetchMyCurrentBorrowings(token: string, size = 3) {
  const search = new URLSearchParams({
    page: '1',
    size: String(size),
    sort: 'dueDate,asc',
  })

  return requestJson(`/api/v1/borrowings/me?${search.toString()}`, {
    method: 'GET',
    headers: buildAuthHeaders(token, false),
  }, borrowingPageSchema)
}

/**
 * 获取当前用户最近归还的历史借阅。
 *
 * @param token 访问令牌
 * @returns 历史借阅分页结果
 */
export async function fetchMyBorrowingHistory(token: string, size = 3) {
  const search = new URLSearchParams({
    page: '1',
    size: String(size),
  })

  return requestJson(`/api/v1/borrowings/history?${search.toString()}`, {
    method: 'GET',
    headers: buildAuthHeaders(token, false),
  }, borrowingPageSchema)
}

/**
 * 续借当前用户的一条借阅记录。
 *
 * @param token 访问令牌
 * @param borrowId 借阅 ID
 * @returns 续借后的借阅记录
 */
export async function renewBorrowing(token: string, borrowId: number) {
  return requestJson(`/api/v1/borrowings/${borrowId}/renew`, {
    method: 'POST',
    headers: buildAuthHeaders(token, false),
  }, borrowingRecordSchema)
}

/**
 * 归还当前用户的一条借阅记录。
 *
 * @param token 访问令牌
 * @param borrowId 借阅 ID
 * @returns 归还后的借阅记录
 */
export async function returnBorrowing(token: string, borrowId: number) {
  return requestJson(`/api/v1/borrowings/${borrowId}/return`, {
    method: 'POST',
    headers: buildAuthHeaders(token, false),
  }, borrowingRecordSchema)
}
