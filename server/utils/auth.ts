import { z } from 'zod'

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128)
})

export const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80)
})

export function publicUser(user: { id: number, email: string, name: string | null, role: 'USER' | 'ADMIN' }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function requireAdmin(event: Parameters<typeof requireUserSession>[0]) {
  const session = await requireUserSession(event)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true }
  })

  if (user?.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Administrator access required' })
  }

  return session
}
