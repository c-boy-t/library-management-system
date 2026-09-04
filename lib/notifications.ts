import { z } from 'zod'

import { buildAdminOverdueAckStreamHeaders, parseSseChunk } from '@/lib/admin-overdue-ack-stream'
import { ApiError, buildApiUrl, getAuthToken, requestJson } from '@/lib/api'

const numericFlagSchema = z.union([z.number(), z.string()]).transform((value) => Number(value) || 0)

export const notificationSchema = z.object({
  notificationId: z.number(),
  userId: z.number(),
  borrowId: z.number().optional().nullable(),
  notificationType: z.string(),
  title: z.string(),
  content: z.string().optional().nullable(),
  isRead: numericFlagSchema,
  actionRequired: z.boolean().optional().default(false),
  actionStatus: z.string().optional().nullable(),
  actionTime: z.string().optional().nullable(),
  createTime: z.string().optional().nullable(),
})

export const notificationPageSchema = z.object({
  total: z.number(),
  pages: z.number(),
  pageNum: z.number(),
  pageSize: z.number(),
  list: z.array(notificationSchema),
})

export const batchOverdueReminderResponseSchema = z.object({
  targetUserCount: z.number(),
  createdNotificationCount: z.number(),
  skippedUserCount: z.number(),
})

export type NotificationItem = z.infer<typeof notificationSchema>
export type NotificationPage = z.infer<typeof notificationPageSchema>
export type BatchOverdueReminderResponse = z.infer<typeof batchOverdueReminderResponseSchema>

export interface NotificationPageParams {
  page: number
  size: number
  isRead?: number
  notificationType?: string
  sort?: string
}

export async function fetchNotifications(params: NotificationPageParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    sort: params.sort ?? 'createTime,desc',
  })

  if (params.isRead !== undefined) {
    search.set('isRead', String(params.isRead))
  }

  if (params.notificationType?.trim()) {
    search.set('notificationType', params.notificationType.trim())
  }

  return requestJson(`/api/v1/notifications?${search.toString()}`, {
    method: 'GET',
  }, notificationPageSchema)
}

export async function handleNotificationAction(notificationId: number, action: 'RECEIVED' | 'IGNORED') {
  return requestJson(`/api/v1/notifications/${notificationId}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  }, notificationSchema)
}

export async function markNotificationsRead(notificationIds: number[]) {
  return requestJson('/api/v1/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ notificationIds }),
  }, z.void())
}

export async function sendOverdueReminders() {
  return requestJson('/api/v1/admin/notifications/overdue-reminders', {
    method: 'POST',
  }, batchOverdueReminderResponseSchema)
}

export interface AdminOverdueAckSubscriptionOptions {
  onMessage: (notification: NotificationItem) => void
  onError?: (error: unknown) => void
  signal?: AbortSignal
}

export function subscribeAdminOverdueAcks(options: AdminOverdueAckSubscriptionOptions) {
  const controller = new AbortController()
  const decoder = new TextDecoder()
  let active = true
  let retryDelay = 1000
  let retryTimer: ReturnType<typeof window.setTimeout> | null = null

  const abort = () => {
    active = false
    if (retryTimer !== null) {
      window.clearTimeout(retryTimer)
    }
    controller.abort()
  }

  if (options.signal) {
    if (options.signal.aborted) {
      abort()
    } else {
      options.signal.addEventListener('abort', abort, { once: true })
    }
  }

  const scheduleReconnect = () => {
    if (!active || controller.signal.aborted) {
      return
    }

    retryTimer = window.setTimeout(() => {
      retryTimer = null
      void connect()
    }, retryDelay)
    retryDelay = Math.min(retryDelay * 2, 15000)
  }

  const connect = async () => {
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    let buffer = ''

    try {
      const response = await fetch(buildApiUrl('/api/v1/admin/notifications/overdue-acks/stream'), {
        method: 'GET',
        headers: buildAdminOverdueAckStreamHeaders(getAuthToken()),
        signal: controller.signal,
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          active = false
        }
        throw new ApiError(response.status, response.statusText || 'SSE connection failed')
      }

      if (!response.body) {
        throw new ApiError(response.status || 500, 'SSE response body is empty')
      }

      retryDelay = 1000
      reader = response.body.getReader()

      while (active && !controller.signal.aborted) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }

        const parsed = parseSseChunk(buffer, decoder.decode(value, { stream: true }))
        buffer = parsed.buffer

        for (const message of parsed.messages) {
          if (message.event !== 'overdue-ack') {
            continue
          }

          const notification = notificationSchema.parse(JSON.parse(message.data))
          options.onMessage(notification)
        }
      }
    } catch (error) {
      if (!controller.signal.aborted && active) {
        options.onError?.(error)
      }
    } finally {
      reader?.releaseLock()
      scheduleReconnect()
    }
  }

  void connect()

  return () => {
    if (options.signal) {
      options.signal.removeEventListener('abort', abort)
    }
    abort()
  }
}
