import { z } from 'zod'
import { requireAdmin } from '../../utils/auth'
import { parseBody, parseId } from '../../utils/catalog'

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED'])
}).strict()

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = parseId(getRouterParam(event, 'id'))
  const data = parseBody(schema.safeParse(await readBody(event)))
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  if (order.status === data.status) return order
  if (order.status === 'FULFILLED' || order.status === 'CANCELLED') {
    throw createError({ statusCode: 409, statusMessage: `${order.status.toLowerCase()} orders cannot be changed` })
  }
  if (order.status === 'PENDING' && data.status === 'FULFILLED') {
    throw createError({ statusCode: 409, statusMessage: 'Confirm the order before fulfilling it' })
  }

  return prisma.$transaction(async (tx) => {
    if (data.status === 'CANCELLED') {
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      }
    }
    return tx.order.update({ where: { id }, data, include: { items: true } })
  })
})
