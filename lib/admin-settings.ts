import { z } from 'zod'

import { requestJson } from '@/lib/api'

export const systemSettingsSchema = z.object({
  libraryName: z.string(),
  contactEmail: z.string(),
  phone: z.string(),
})

export type SystemSettings = z.infer<typeof systemSettingsSchema>

export interface UpdateSettingsPayload {
  libraryName?: string
  contactEmail?: string
  phone?: string
}

export async function fetchSystemSettings() {
  return requestJson('/api/v1/admin/settings', {
    method: 'GET',
  }, systemSettingsSchema)
}

export async function updateSystemSettings(payload: UpdateSettingsPayload) {
  return requestJson('/api/v1/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, systemSettingsSchema)
}
