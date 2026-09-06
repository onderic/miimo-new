import { credentialsSchema, publicUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const result = credentialsSchema.safeParse(await readBody(event))

  if (!result.success) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email }
  })

  if (!user?.passwordHash || !await verifyPassword(user.passwordHash, result.data.password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  if (passwordNeedsReHash(user.passwordHash)) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(result.data.password) }
    })
  }

  await setUserSession(event, {
    user: publicUser(user),
    loggedInAt: Date.now()
  })

  return { user: publicUser(user) }
})
