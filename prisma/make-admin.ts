import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client'

const email = process.argv[2]?.trim().toLowerCase()
const connectionString = process.env.DATABASE_URL

if (!email) throw new Error('Usage: pnpm db:make-admin user@example.com')
if (!connectionString) throw new Error('DATABASE_URL is required')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const result = await prisma.user.updateMany({
  where: { email },
  data: { role: 'ADMIN' }
})

await prisma.$disconnect()

if (result.count === 0) throw new Error(`No user found with email: ${email}`)
console.log(`${email} is now an administrator.`)
