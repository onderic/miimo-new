import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database')
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

await prisma.user.upsert({
  where: { email: 'demo@example.com' },
  update: {},
  create: {
    email: 'demo@example.com',
    name: 'Demo User',
    posts: {
      create: {
        title: 'Welcome to Ecommerve',
        content: 'This row was created by prisma/seed.ts.',
        published: true
      }
    }
  }
})

const categories = [
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Botanical formulas for cleansing, hydration, and skin barrier care.',
    imageUrl: 'https://images.pexels.com/photos/2566853/pexels-photo-2566853.jpeg'
  },
  {
    name: 'Haircare',
    slug: 'haircare',
    description: 'Gentle products for healthy hair, roots, and scalp.',
    imageUrl: 'https://images.pexels.com/photos/8167172/pexels-photo-8167172.jpeg'
  },
  {
    name: 'Body Care',
    slug: 'body-care',
    description: 'Everyday botanical care for soft, nourished skin.',
    imageUrl: 'https://images.pexels.com/photos/7796743/pexels-photo-7796743.jpeg'
  }
]

const categoryIds = new Map<string, number>()

for (const category of categories) {
  const saved = await prisma.category.upsert({
    where: { slug: category.slug },
    update: category,
    create: category
  })
  categoryIds.set(category.slug, saved.id)
}

const products = [
  { name: 'Rosewater Barrier Serum', slug: 'rosewater-barrier-serum', sku: 'SKIN-001', description: 'Damask rose and niacinamide for calm, hydrated skin.', priceCents: 490000, stock: 35, status: 'ACTIVE' as const, category: 'skincare', imageUrl: 'https://images.pexels.com/photos/2566853/pexels-photo-2566853.jpeg' },
  { name: 'Camellia Cream Veil', slug: 'camellia-cream-veil', sku: 'SKIN-002', description: 'A lightweight cream that seals in moisture without shine.', priceCents: 540000, stock: 28, status: 'ACTIVE' as const, category: 'skincare', imageUrl: 'https://images.pexels.com/photos/30979444/pexels-photo-30979444/free-photo-of-minimalist-skincare-product-on-white-plate.jpeg' },
  { name: 'Bakuchiol Night Polish', slug: 'bakuchiol-night-polish', sku: 'SKIN-003', description: 'Gentle retinol-alternative resurfacing treatment.', priceCents: 440000, stock: 19, status: 'ACTIVE' as const, category: 'skincare', imageUrl: 'https://images.pexels.com/photos/15569182/pexels-photo-15569182/free-photo-of-bottle-with-a-cosmetic-product.jpeg' },
  { name: 'Centella Eye Balm', slug: 'centella-eye-balm', sku: 'SKIN-004', description: 'Cooling eye balm that helps reduce visible puffiness.', priceCents: 340000, stock: 42, status: 'ACTIVE' as const, category: 'skincare', imageUrl: 'https://images.pexels.com/photos/7796743/pexels-photo-7796743.jpeg' },
  { name: 'Green Tea Gel Cleanser', slug: 'green-tea-gel-cleanser', sku: 'SKIN-005', description: 'A refreshing daily cleanser for balanced skin.', priceCents: 280000, stock: 51, status: 'DRAFT' as const, category: 'skincare', imageUrl: 'https://images.pexels.com/photos/7815016/pexels-photo-7815016.jpeg' },
  { name: 'Argan Root Shampoo', slug: 'argan-root-shampoo', sku: 'HAIR-001', description: 'A sulfate-free cleanse that respects color and scalp.', priceCents: 380000, stock: 44, status: 'ACTIVE' as const, category: 'haircare', imageUrl: 'https://images.pexels.com/photos/8167172/pexels-photo-8167172.jpeg' },
  { name: 'Marula Silk Conditioner', slug: 'marula-silk-conditioner', sku: 'HAIR-002', description: 'Detangles and seals split ends without weighing hair down.', priceCents: 380000, stock: 39, status: 'ACTIVE' as const, category: 'haircare', imageUrl: 'https://images.pexels.com/photos/8167156/pexels-photo-8167156.jpeg' },
  { name: 'Rosemary Growth Oil', slug: 'rosemary-growth-oil', sku: 'HAIR-003', description: 'Scalp-stimulating oil for stronger, fuller-looking hair.', priceCents: 470000, stock: 23, status: 'ACTIVE' as const, category: 'haircare', imageUrl: 'https://images.pexels.com/photos/8167117/pexels-photo-8167117.jpeg' },
  { name: 'Heat-Shield Leave-in', slug: 'heat-shield-leave-in', sku: 'HAIR-004', description: 'Protects styled hair from heat and adds smooth shine.', priceCents: 310000, stock: 31, status: 'ACTIVE' as const, category: 'haircare', imageUrl: 'https://images.pexels.com/photos/8166777/pexels-photo-8166777.jpeg' },
  { name: 'Hibiscus Curl Cream', slug: 'hibiscus-curl-cream', sku: 'HAIR-005', description: 'Defines curls while maintaining soft, flexible hold.', priceCents: 360000, stock: 16, status: 'DRAFT' as const, category: 'haircare', imageUrl: 'https://images.pexels.com/photos/8167156/pexels-photo-8167156.jpeg' },
  { name: 'Shea Body Butter', slug: 'shea-body-butter', sku: 'BODY-001', description: 'Rich whipped moisture for dry and delicate skin.', priceCents: 320000, stock: 48, status: 'ACTIVE' as const, category: 'body-care', imageUrl: 'https://images.pexels.com/photos/7796743/pexels-photo-7796743.jpeg' },
  { name: 'Baobab Body Oil', slug: 'baobab-body-oil', sku: 'BODY-002', description: 'Fast-absorbing botanical oil with a soft finish.', priceCents: 390000, stock: 27, status: 'ACTIVE' as const, category: 'body-care', imageUrl: 'https://images.pexels.com/photos/2566853/pexels-photo-2566853.jpeg' },
  { name: 'Coffee Sugar Polish', slug: 'coffee-sugar-polish', sku: 'BODY-003', description: 'A smoothing body polish made with Kenyan coffee.', priceCents: 260000, stock: 21, status: 'ACTIVE' as const, category: 'body-care', imageUrl: 'https://images.pexels.com/photos/15569182/pexels-photo-15569182/free-photo-of-bottle-with-a-cosmetic-product.jpeg' },
  { name: 'Aloe Hand Cream', slug: 'aloe-hand-cream', sku: 'BODY-004', description: 'Quick-drying hydration for hands and cuticles.', priceCents: 180000, stock: 62, status: 'ACTIVE' as const, category: 'body-care', imageUrl: 'https://images.pexels.com/photos/30979444/pexels-photo-30979444/free-photo-of-minimalist-skincare-product-on-white-plate.jpeg' },
  { name: 'Lavender Bath Soak', slug: 'lavender-bath-soak', sku: 'BODY-005', description: 'Mineral bath salts scented with real lavender.', priceCents: 240000, stock: 14, status: 'ARCHIVED' as const, category: 'body-care', imageUrl: 'https://images.pexels.com/photos/7815016/pexels-photo-7815016.jpeg' }
]

for (const product of products) {
  const { category, ...data } = product
  const categoryId = categoryIds.get(category)
  if (!categoryId) throw new Error(`Missing category: ${category}`)

  await prisma.product.upsert({
    where: { sku: data.sku },
    update: { ...data, categoryId },
    create: { ...data, categoryId }
  })
}

await prisma.$disconnect()
