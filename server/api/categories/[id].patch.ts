import { requireAdmin } from '../../utils/auth'
import { categoryUpdateSchema, parseBody, parseId } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'))
  const data = parseBody(categoryUpdateSchema.safeParse(await readBody(event)))
  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Category not found' })

  return prisma.category.update({ where: { id }, data })
})
