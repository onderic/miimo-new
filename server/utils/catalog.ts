import { z } from 'zod'

export const idSchema = z.coerce.number().int().positive()

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  imageUrl: z.string().max(2000).nullable().optional(),
  active: z.boolean().optional()
}).strict()

export const categoryUpdateSchema = categoryCreateSchema.partial()

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  sku: z.string().trim().toUpperCase().min(2).max(80),
  description: z.string().trim().max(5000).nullable().optional(),
  priceCents: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().max(2000).nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  categoryId: z.number().int().positive()
}).strict()

export const productUpdateSchema = productCreateSchema.partial()

export function parseId(value: string | undefined) {
  const result = idSchema.safeParse(value)
  if (!result.success) throw createError({ statusCode: 400, statusMessage: 'Invalid resource ID' })
  return result.data
}

export function parseBody<T>(result: { success: true, data: T } | { success: false, error: z.ZodError }) {
  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: result.error.issues[0]?.message || 'Invalid request body'
    })
  }
  return result.data
}
