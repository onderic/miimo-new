export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const users = await prisma.user.findMany({
    omit: { passwordHash: true },
    include: { posts: true }
  })
  return users
})
