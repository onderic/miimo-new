import { randomBytes } from 'node:crypto'
import { z } from 'zod'

const schema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7).max(30),
  deliveryAddress: z.string().trim().min(10).max(500),
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) })).min(1).max(50)
})

export default defineEventHandler(async (event) => {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 422, statusMessage: parsed.error.issues[0]?.message || 'Invalid order' })

  const session = await getUserSession(event)
  const ids = [...new Set(parsed.data.items.map(item => item.productId))]
  const products = await prisma.product.findMany({ where: { id: { in: ids }, status: 'ACTIVE' } })
  if (products.length !== ids.length) throw createError({ statusCode: 422, statusMessage: 'One or more products are unavailable' })

  const byId = new Map(products.map(product => [product.id, product]))
  const items = parsed.data.items.map((item) => {
    const product = byId.get(item.productId)!
    return { ...item, productName: product.name, unitPriceCents: product.priceCents }
  })
  const totalCents = items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0)
  const reference = `BLM-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } }
      })
      if (updated.count === 0) throw createError({ statusCode: 409, statusMessage: `${item.productName} does not have enough stock` })
    }

    return tx.order.create({
      data: {
        reference,
        customerName: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        deliveryAddress: parsed.data.deliveryAddress,
        totalCents,
        userId: session.user?.id,
        items: { create: items.map(item => ({ productId: item.productId, productName: item.productName, unitPriceCents: item.unitPriceCents, quantity: item.quantity })) }
      },
      include: { items: true }
    })
  })

  return { id: order.id, reference: order.reference, totalCents: order.totalCents, status: order.status }
})
