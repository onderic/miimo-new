import { publicUser } from '../utils/auth'

export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session) => {
    if (!session.user?.id) return

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true, role: true }
      })

      if (user) session.user = publicUser(user)
    } catch {
      throw createError({ statusCode: 503, statusMessage: 'Database is unavailable' })
    }
  })
})
