import { requireAdmin } from '../../utils/auth'
import { parseId } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'))
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, _count: { select: { products: true } } }
  })

  if (!category) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  if (category._count.products > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Remove or reassign products before deleting this category' })
  }

  await prisma.category.delete({ where: { id } })
  setResponseStatus(event, 204)
  return null
})
