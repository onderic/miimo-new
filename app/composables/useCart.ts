import type { CartItem, Product } from '~/types'

export function useCart() {
  const items = useState<CartItem[]>('cart', () => [])
  const loaded = useState('cart-loaded', () => false)
  const open = useState('cart-open', () => false)

  if (import.meta.client) {
    onMounted(() => {
      if (loaded.value) return

      loaded.value = true
      try {
        const savedItems = JSON.parse(localStorage.getItem('bloomstead-cart') || '[]') as CartItem[]
        items.value = savedItems
          .filter(item => Number.isInteger(item.product?.id) && item.product.id > 0)
          .map(item => ({
            ...item,
            quantity: Number.isFinite(Number(item.quantity))
              ? Math.max(1, Math.min(Math.trunc(Number(item.quantity)), item.product.stock))
              : 1
          }))
      } catch {
        items.value = []
      }
    })

    watch(items, (value) => {
      if (loaded.value) localStorage.setItem('bloomstead-cart', JSON.stringify(value))
    }, { deep: true })
  }

  function add(product: Product, quantity = 1) {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(1, Math.trunc(quantity)) : 1
    const item = items.value.find(entry => entry.product.id === product.id)
    if (item) item.quantity = Math.min(item.quantity + safeQuantity, product.stock)
    else items.value.push({ product, quantity: Math.min(safeQuantity, product.stock) })
  }

  function update(productId: number, quantity: unknown) {
    const nextQuantity = Number(quantity)
    if (!Number.isFinite(nextQuantity)) return

    const item = items.value.find(entry => entry.product.id === productId)
    if (item) item.quantity = Math.max(1, Math.min(Math.trunc(nextQuantity), item.product.stock))
  }

  function remove(productId: number) {
    items.value = items.value.filter(entry => entry.product.id !== productId)
  }

  function clear() {
    items.value = []
  }

  const count = computed(() => items.value.reduce((total, item) => total + item.quantity, 0))
  const totalCents = computed(() => items.value.reduce((total, item) => total + item.product.priceCents * item.quantity, 0))

  return { items, count, totalCents, open, add, update, remove, clear }
}
