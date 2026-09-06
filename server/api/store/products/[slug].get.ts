export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const product = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE', category: { active: true } },
    include: { category: true }
  })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return product
})
