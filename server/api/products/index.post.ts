import { requireAdmin } from '../../utils/auth'
import { parseBody, productCreateSchema } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = parseBody(productCreateSchema.safeParse(await readBody(event)))

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
  if (!category) throw createError({ statusCode: 422, statusMessage: 'Category does not exist' })

  return prisma.product.create({
    data,
    include: { category: true }
  })
})
