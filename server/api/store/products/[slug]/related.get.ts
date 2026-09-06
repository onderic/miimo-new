export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Product slug is required' })

  const product = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE', category: { active: true } },
    select: { id: true, categoryId: true }
  })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  return prisma.product.findMany({
    where: {
      id: { not: product.id },
      categoryId: product.categoryId,
      status: 'ACTIVE',
      category: { active: true }
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 4
  })
})
