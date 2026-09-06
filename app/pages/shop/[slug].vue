<script setup lang="ts">
import type { Product } from '~/types'

definePageMeta({ layout: 'public' })
const route = useRoute()
const toast = useToast()
const quantity = ref(1)
const { add, count, open } = useCart()
const { data: product, error } = await useFetch<Product>(`/api/store/products/${route.params.slug}`)
const { data: relatedProducts } = await useFetch<Product[]>(`/api/store/products/${route.params.slug}/related`, {
  default: () => []
})

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

function addToCart() {
  if (!product.value) return
  add(product.value, quantity.value)
  toast.add({
    title: 'Added to cart',
    description: product.value.name,
    icon: 'i-lucide-circle-check',
    color: 'success'
  })
}

function addRelatedProduct(relatedProduct: Product) {
  add(relatedProduct)
  toast.add({
    title: 'Added to cart',
    description: relatedProduct.name,
    icon: 'i-lucide-circle-check',
    color: 'success'
  })
}

useSeoMeta({
  title: () => product.value ? `${product.value.name} | Miimo Natural Products` : 'Miimo Natural Products',
  description: () => product.value?.description || 'Natural hair care and skincare made in Nairobi, Kenya.',
  ogTitle: () => product.value?.name,
  ogDescription: () => product.value?.description || undefined,
  ogImage: () => product.value?.imageUrl || '/images/miimo/hero.webp',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div class="min-h-screen bg-[#fffbf8] text-[#2b1b20]">
    <UContainer class="py-8 sm:py-16">
      <UButton
        to="/shop"
        icon="i-lucide-arrow-left"
        label="Back to shop"
        color="neutral"
        variant="link"
        class="mb-8"
      />
      <div v-if="product" class="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div class="overflow-hidden rounded-2xl bg-[#fbedf1]">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="aspect-square h-full w-full object-cover"
          >
          <div v-else class="grid aspect-square place-items-center">
            <UIcon name="i-lucide-package" class="size-20 text-[#a83a5c]" />
          </div>
        </div>
        <div class="flex flex-col justify-center">
          <p class="flex items-center gap-2 text-sm font-medium text-[#a83a5c]">
            <UIcon name="i-lucide-leaf" />{{ product.category.name }}
          </p>
          <h1 class="mt-4 font-serif text-4xl font-medium sm:text-5xl">
            {{ product.name }}
          </h1>
          <p class="mt-5 text-lg leading-8 text-[#6b5158]">
            {{ product.description }}
          </p>
          <p class="mt-7 font-serif text-3xl">
            {{ formatMoney(product.priceCents) }}
          </p>
          <p class="mt-2 text-sm text-[#6b5158]">
            {{ product.stock }} available
          </p>
          <div class="mt-8 flex items-center gap-3">
            <UInputNumber
              v-model="quantity"
              :min="1"
              :max="product.stock"
              class="w-32"
            />
            <UButton
              size="xl"
              icon="i-lucide-shopping-bag"
              class="rounded-full px-8"
              :disabled="product.stock === 0"
              @click="addToCart"
            >
              Add to cart
            </UButton>
          </div>
          <UButton
            v-if="count"
            label="View cart"
            color="neutral"
            variant="link"
            class="mt-3 self-start"
            @click="open = true"
          />
        </div>
      </div>

      <section v-if="relatedProducts.length" class="mt-20 border-t border-[#f2d7e1] pt-12">
        <div class="mb-8">
          <p class="text-sm font-medium text-[#be124f]">
            You may also like
          </p>
          <h2 class="mt-2 font-serif text-3xl font-medium">
            Related products
          </h2>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <UCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            class="overflow-hidden"
            :ui="{ body: 'p-0 sm:p-0' }"
          >
            <NuxtLink :to="`/shop/${relatedProduct.slug}`" class="block aspect-square overflow-hidden bg-[#fff5f8]">
              <img
                v-if="relatedProduct.imageUrl"
                :src="relatedProduct.imageUrl"
                :alt="relatedProduct.name"
                class="size-full object-cover transition-transform duration-300 hover:scale-105"
              >
              <div v-else class="grid size-full place-items-center">
                <UIcon name="i-lucide-package" class="size-12 text-[#be124f]" />
              </div>
            </NuxtLink>
            <div class="p-4">
              <p class="text-xs text-[#be124f]">
                {{ relatedProduct.category.name }}
              </p>
              <NuxtLink :to="`/shop/${relatedProduct.slug}`" class="mt-1 block font-medium">
                {{ relatedProduct.name }}
              </NuxtLink>
              <div class="mt-4 flex items-center justify-between gap-3">
                <strong>{{ formatMoney(relatedProduct.priceCents) }}</strong>
                <UButton
                  icon="i-lucide-plus"
                  color="primary"
                  variant="soft"
                  square
                  aria-label="Add product to cart"
                  :disabled="relatedProduct.stock === 0"
                  @click="addRelatedProduct(relatedProduct)"
                />
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </UContainer>
  </div>
</template>
