import { z } from 'zod'

const querySchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date()
})

function variation(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Select a valid analytics date range' })
  }

  const start = new Date(parsed.data.start)
  start.setHours(0, 0, 0, 0)
  const end = new Date(parsed.data.end)
  end.setHours(23, 59, 59, 999)

  const duration = end.getTime() - start.getTime() + 1
  const previousEnd = new Date(start.getTime() - 1)
  const previousStart = new Date(previousEnd.getTime() - duration + 1)

  const [products, categories, orders, previousOrders, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, totalCents: true }
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: previousStart, lte: previousEnd }, status: { not: 'CANCELLED' } },
      select: { totalCents: true }
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, reference: true, createdAt: true, status: true, email: true, totalCents: true }
    })
  ])

  const revenue = orders.reduce((sum, order) => sum + order.totalCents, 0)
  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalCents, 0)

  return {
    stats: {
      products,
      categories,
      revenue,
      orders: orders.length,
      revenueVariation: variation(revenue, previousRevenue),
      ordersVariation: variation(orders.length, previousOrders.length)
    },
    revenue: orders.map(order => ({ date: order.createdAt, amount: order.totalCents })),
    recentOrders
  }
})
