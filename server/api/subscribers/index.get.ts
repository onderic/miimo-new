import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } })
})
