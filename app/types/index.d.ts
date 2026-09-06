import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export interface CategorySummary {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Category extends CategorySummary {
  products?: Product[]
  _count?: {
    products: number
  }
}

export interface Product {
  id: number
  name: string
  slug: string
  sku: string
  description: string | null
  priceCents: number
  stock: number
  imageUrl: string | null
  status: ProductStatus
  categoryId: number
  category: CategorySummary
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Analytics {
  stats: {
    products: number
    categories: number
    revenue: number
    orders: number
    revenueVariation: number
    ordersVariation: number
  }
  revenue: Array<{ date: string, amount: number }>
  recentOrders: Array<Pick<Order, 'id' | 'reference' | 'createdAt' | 'status' | 'email' | 'totalCents'>>
}

export interface NewsletterSubscriber {
  id: number
  email: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED'

export interface Order {
  id: number
  reference: string
  status: OrderStatus
  customerName: string
  email: string
  phone: string
  deliveryAddress: string
  totalCents: number
  createdAt: string
  items: Array<{
    id: number
    productName: string
    quantity: number
    unitPriceCents: number
  }>
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
