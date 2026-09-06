import { z } from 'zod'

const schema = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address') })

export default defineEventHandler(async (event) => {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: parsed.error.issues[0]?.message || 'Invalid email address' })
  }

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { active: true },
    create: { email: parsed.data.email }
  })

  return { id: subscriber.id, email: subscriber.email, subscribed: true }
})
