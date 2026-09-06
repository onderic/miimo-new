import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })
})
