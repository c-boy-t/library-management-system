import { z } from 'zod'

import { requestJson } from '@/lib/api'

const numericStatusSchema = z.union([z.number(), z.string()]).transform((value) => Number(value))

export const adminUserSchema = z.object({
  userId: z.number(),
  username: z.string(),
  email: z.string().optional().nullable(),
  realName: z.string().optional().nullable(),
  gender: z.number().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  status: numericStatusSchema,
  lastOperationTime: z.string().optional().nullable(),
  lockedUntil: z.string().optional().nullable(),
})

export const adminUserPageSchema = z.object({
  total: z.number(),
  pages: z.number(),
  pageNum: z.number(),
  pageSize: z.number(),
  list: z.array(adminUserSchema),
})

export type AdminUser = z.infer<typeof adminUserSchema>
export type AdminUserPage = z.infer<typeof adminUserPageSchema>

export interface FetchAdminUsersParams {
  page: number
  size: number
  realName?: string
  status?: number
}

export async function fetchAdminUsers(params: FetchAdminUsersParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: 'updateTime,desc',
  })

  if (params.realName?.trim()) {
    search.set('realName', params.realName.trim())
  }

  if (params.status !== undefined) {
    search.set('status', String(params.status))
  }

  return requestJson(`/api/v1/admin/users?${search.toString()}`, {
    method: 'GET',
  }, adminUserPageSchema)
}

export async function updateAdminUserStatus(userId: number, status: number) {
  return requestJson(`/api/v1/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }, adminUserSchema)
}

export async function resetAdminUserPassword(
  userId: number,
  payload: { newPassword: string; confirmPassword: string },
) {
  return requestJson(`/api/v1/admin/users/${userId}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, adminUserSchema)
}
