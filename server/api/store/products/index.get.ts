export default defineEventHandler(() => {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', category: { active: true } },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })
})
