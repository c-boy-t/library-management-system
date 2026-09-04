import { requestJson } from '@/lib/api'
import { borrowingPageSchema, type BorrowingRecord, type BorrowingPage } from '@/lib/borrowings'

export type { BorrowingRecord, BorrowingPage }

export interface AdminBorrowingPageParams {
  page: number
  size: number
  userId?: number
  bookId?: number
  status?: string
  search?: string
  sort?: string
}

export async function fetchAdminBorrowingRecords(params: AdminBorrowingPageParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: params.sort ?? 'createTime,desc',
  })

  if (params.userId) search.set('userId', String(params.userId))
  if (params.bookId) search.set('bookId', String(params.bookId))
  if (params.status?.trim()) search.set('status', params.status.trim())
  if (params.search?.trim()) search.set('search', params.search.trim())

  return requestJson(`/api/v1/admin/borrowings?${search.toString()}`, {
    method: 'GET',
  }, borrowingPageSchema)
}

export async function fetchAdminOverdueRecords(params: AdminBorrowingPageParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: params.sort ?? 'dueDate,asc',
  })

  if (params.search?.trim()) search.set('search', params.search.trim())

  return requestJson(`/api/v1/admin/borrowings/overdue?${search.toString()}`, {
    method: 'GET',
  }, borrowingPageSchema)
}
