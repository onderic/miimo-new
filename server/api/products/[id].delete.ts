import { requireAdmin } from '../../utils/auth'
import { parseId } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'))
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  await prisma.product.delete({ where: { id } })
  setResponseStatus(event, 204)
  return null
})
