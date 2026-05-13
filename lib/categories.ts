import { z } from 'zod'

import { requestJson } from '@/lib/api'

export const categorySchema = z.object({
  categoryId: z.number(),
  categoryName: z.string(),
  description: z.string().optional().nullable(),
})

export type Category = z.infer<typeof categorySchema>

/**
 * 获取分类列表。
 */
export async function fetchCategories() {
  return requestJson('/api/v1/categories', {
    method: 'GET',
  }, z.array(categorySchema))
}
