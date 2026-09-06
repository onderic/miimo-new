export default defineEventHandler(() => {
  return prisma.category.findMany({
    where: { active: true, products: { some: { status: 'ACTIVE' } } },
    orderBy: { name: 'asc' }
  })
})
