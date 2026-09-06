import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })
})
