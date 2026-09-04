import { z } from 'zod'

import { useAuthStore } from '@/store/auth-store'

/**
 * API 请求错误。
 */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

/**
 * 获取后端基础地址。
 *
 * <p>开发环境默认指向本地 Spring Boot 服务，生产环境可通过环境变量覆盖。</p>
 */
export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')
}

/**
 * 构建完整 API 地址。
 *
 * @param path 接口路径
 * @returns 完整请求地址
 */
export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath
}

/**
 * 创建通用请求头。
 *
 * @param token 访问令牌
 * @param hasBody 是否携带 JSON 请求体
 * @returns 请求头对象
 */
export function buildAuthHeaders(token?: string | null, hasBody = true) {
  return {
    Accept: 'application/json',
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * 获取当前登录令牌。
 *
 * <p>供 requestJson 自动注入使用；绕过 requestJson 的请求（如 FormData 上传、SSE 流）也可调用。</p>
 */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token
}

/**
 * requestJson 附加选项。
 */
export interface RequestJsonOptions {
  /** 匿名接口（登录/注册）传 true，跳过自动注入 Authorization。 */
  skipAuth?: boolean
}

const resultEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string().optional().default('Success'),
    data: dataSchema.nullable().optional(),
    timestamp: z.string().optional(),
  })

async function readResponseBody(response: Response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * 发送 JSON 请求并解析统一响应包装。
 *
 * <p>请求发出前自动从认证状态读取令牌并注入 Authorization 头，调用方无需手动传 token；
 * 登录/注册等匿名接口通过 options.skipAuth 跳过注入。Content-Type 仅在请求体为字符串
 * （JSON）时设置，FormData 等其他类型交由浏览器自行生成。</p>
 *
 * <p><b>请求头覆盖语义：</b>自动注入的请求头（Authorization / Content-Type / Accept）先铺底，
 * {@code init.headers} 后展开、调用方优先。因此调用方传入的同名头会<strong>静默覆盖</strong>
 * 自动注入值（例如传 {@code 'Content-Type': 'text/plain'} 会覆盖 JSON Content-Type）。
 * 除非确有特殊协议需求，调用方不应传递这三个头。</p>
 *
 * @param path 接口路径
 * @param init 请求配置（headers 会覆盖自动注入的 Authorization / Content-Type / Accept，慎传）
 * @param dataSchema 响应 data 的校验规则
 * @param options 附加选项（skipAuth 等）
 * @returns 解析后的 data
 */
export async function requestJson<T>(
  path: string,
  init: RequestInit,
  dataSchema: z.ZodType<T, z.ZodTypeDef, unknown>,
  options?: RequestJsonOptions,
): Promise<T> {
  const token = options?.skipAuth ? null : getAuthToken()
  const hasJsonBody = typeof init.body === 'string'

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      ...buildAuthHeaders(token, hasJsonBody),
      ...(init.headers ?? {}),
    },
  })

  const payload = await readResponseBody(response)
  const parsed = resultEnvelopeSchema(dataSchema).safeParse(payload)

  if (!parsed.success) {
    throw new ApiError(response.status || 500, response.ok ? 'Invalid API response' : response.statusText || 'Request failed')
  }

  const message = parsed.data.message || (response.ok ? 'Success' : 'Request failed')
  if (!response.ok || parsed.data.code >= 400) {
    throw new ApiError(response.status || parsed.data.code || 500, message)
  }

  if (parsed.data.data === null || parsed.data.data === undefined) {
    return undefined as T
  }

  return parsed.data.data
}

export { noopStorage }
