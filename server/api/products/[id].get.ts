import { requireAdmin } from '../../utils/auth'
import { parseId } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'))
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  })

  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return product
})
