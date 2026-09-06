import { requireAdmin } from '../../utils/auth'
import { categoryCreateSchema, parseBody } from '../../utils/catalog'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = parseBody(categoryCreateSchema.safeParse(await readBody(event)))
  return prisma.category.create({ data })
})
