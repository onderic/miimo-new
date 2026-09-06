import { requireAdmin } from '../../utils/auth'
import { parseId } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'))
  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: true }
  })

  if (!category) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  return category
})
