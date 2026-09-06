import { registrationSchema, publicUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const result = registrationSchema.safeParse(await readBody(event))

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusMessage: result.error.issues[0]?.message || 'Invalid registration details'
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: result.data.email },
    select: { id: true }
  })

  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists' })
  }

  const user = await prisma.user.create({
    data: {
      email: result.data.email,
      name: result.data.name,
      passwordHash: await hashPassword(result.data.password),
      role: 'USER'
    }
  })

  await setUserSession(event, {
    user: publicUser(user),
    loggedInAt: Date.now()
  })

  return { user: publicUser(user) }
})
