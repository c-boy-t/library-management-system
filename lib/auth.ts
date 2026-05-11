import { z } from 'zod'

import { ApiError, buildAuthHeaders, requestJson } from '@/lib/api'

export const authUserSchema = z.object({
  userId: z.number(),
  username: z.string(),
  email: z.string(),
  realName: z.string(),
  role: z.string(),
})

export const authLoginResponseSchema = z.object({
  token: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  user: authUserSchema,
})

export const authTokenResponseSchema = z.object({
  token: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
})

export type AuthUser = z.infer<typeof authUserSchema>
export type AuthLoginResponse = z.infer<typeof authLoginResponseSchema>
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>

export interface AuthLoginPayload {
  username: string
  password: string
}

export interface AuthRegisterPayload {
  username: string
  email: string
  password: string
  confirmPassword: string
  realName: string
  phone?: string
}

/**
 * 用户登录。
 *
 * @param payload 登录参数
 * @returns 登录结果
 */
export async function authLogin(payload: AuthLoginPayload) {
  return requestJson('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, authLoginResponseSchema)
}

/**
 * 用户注册。
 *
 * @param payload 注册参数
 * @returns 注册后的用户摘要
 */
export async function authRegister(payload: AuthRegisterPayload) {
  return requestJson('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      phone: payload.phone?.trim() || undefined,
    }),
  }, authUserSchema)
}

/**
 * 刷新访问令牌。
 *
 * @param token 旧令牌
 * @returns 新令牌响应
 */
export async function authRefreshToken(token: string) {
  return requestJson('/api/v1/auth/refresh-token', {
    method: 'POST',
    headers: buildAuthHeaders(token, false),
  }, authTokenResponseSchema)
}

/**
 * 用户登出。
 *
 * @param token 当前令牌
 */
export async function authLogout(token: string) {
  return requestJson('/api/v1/auth/logout', {
    method: 'POST',
    headers: buildAuthHeaders(token, false),
  }, z.null())
}

export { ApiError }
