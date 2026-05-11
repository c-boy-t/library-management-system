import { z } from 'zod'

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
 * @param path 接口路径
 * @param init 请求配置
 * @param dataSchema 响应 data 的校验规则
 * @returns 解析后的 data
 */
export async function requestJson<T>(
  path: string,
  init: RequestInit,
  dataSchema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      ...buildAuthHeaders(),
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
