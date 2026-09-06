import { Hash } from '../.output/server/node_modules/@adonisjs/hash/build/index.js'
import { Scrypt } from '../.output/server/node_modules/@adonisjs/hash/build/src/drivers/scrypt.js'
import pg from '../.output/server/node_modules/pg/lib/index.js'

const { ADMIN_EMAIL, ADMIN_PASSWORD, DATABASE_URL } = process.env
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !DATABASE_URL) throw new Error('Admin credentials and DATABASE_URL are required')

const passwordHash = await new Hash(new Scrypt()).make(ADMIN_PASSWORD)
const client = new pg.Client({ connectionString: DATABASE_URL })
await client.connect()
await client.query(`
  INSERT INTO "User" ("email", "name", "passwordHash", "role")
  VALUES ($1, $2, $3, 'ADMIN')
  ON CONFLICT ("email") DO UPDATE
  SET "name" = EXCLUDED."name", "passwordHash" = EXCLUDED."passwordHash", "role" = 'ADMIN'
`, [ADMIN_EMAIL.toLowerCase(), 'Miimo Admin', passwordHash])
await client.end()
