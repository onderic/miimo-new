import { requireAdmin } from '../../utils/auth'
import { parseBody, parseId, productUpdateSchema } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'))
  const data = parseBody(productUpdateSchema.safeParse(await readBody(event)))

  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } })
    if (!category) throw createError({ statusCode: 422, statusMessage: 'Category does not exist' })
  }

  return prisma.product.update({ where: { id }, data, include: { category: true } })
})
