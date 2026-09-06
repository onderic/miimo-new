<script setup lang="ts">
import type { Product } from '~/types'

definePageMeta({ layout: 'public' })

const route = useRoute()
const search = ref('')
const category = ref(typeof route.query.category === 'string' ? route.query.category : 'all')
const page = ref(1)
const pageSize = 8
const toast = useToast()
const { add } = useCart()
const { data: products, status, error } = await useFetch<Product[]>('/api/store/products', {
  default: () => []
})

const categoryOptions = computed(() => [{ label: 'All categories', value: 'all' }, ...Array.from(
  new Map(products.value.map(product => [product.category.slug, product.category.name]))
).map(([value, label]) => ({ label, value }))])

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()
  return products.value.filter(product => (
    (category.value === 'all' || product.category.slug === category.value)
    && (!term || [product.name, product.description, product.sku, product.category.name]
      .some(value => value?.toLowerCase().includes(term)))
  ))
})
const paginatedProducts = computed(() => filteredProducts.value.slice((page.value - 1) * pageSize, page.value * pageSize))

watch([search, category], () => {
  page.value = 1
})

watch(() => route.query.category, (value) => {
  category.value = typeof value === 'string' ? value : 'all'
})

function addProduct(product: Product) {
  add(product)
  toast.add({
    title: 'Added to cart',
    description: product.name,
    icon: 'i-lucide-circle-check',
    color: 'success'
  })
}

useSeoMeta({
  title: 'Shop all products — Miimo',
  description: 'Browse Miimo natural hair care, skincare, and body care products.'
})
</script>

<template>
  <div class="min-h-screen bg-[#fffafb] text-[#30151f]">
    <main>
      <section class="relative isolate overflow-hidden border-b border-[#f2d7e1] bg-[#30151f]">
        <img
          src="/images/miimo/banner-skincare.webp"
          alt=""
          class="absolute inset-0 -z-20 size-full object-cover object-center"
        >
        <div class="absolute inset-0 -z-10 bg-gradient-to-r from-[#30151f]/95 via-[#30151f]/75 to-[#30151f]/25" />
        <UContainer class="py-14 text-white sm:py-20">
          <nav class="flex items-center gap-2 text-sm text-white/70" aria-label="Breadcrumb">
            <NuxtLink to="/" class="transition-colors hover:text-white">Home</NuxtLink>
            <UIcon name="i-lucide-chevron-right" class="size-4" />
            <span class="text-white">Shop</span>
          </nav>
          <p class="mt-7 text-sm font-medium text-[#ffa1c1]">
            The Miimo collection
          </p>
          <h1 class="mt-3 max-w-2xl font-serif text-4xl font-medium text-white sm:text-5xl">
            Natural care for your skin, hair, and body.
          </h1>
          <p class="mt-4 max-w-xl text-white/75">
            Browse our complete collection of thoughtfully made formulas.
          </p>
        </UContainer>
      </section>

      <UContainer class="py-10 sm:py-14">
        <div class="flex flex-col gap-3 border-b border-[#f2d7e1] pb-7 sm:flex-row sm:items-center sm:justify-between">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            size="lg"
            placeholder="Search products..."
            aria-label="Search products"
            class="w-full sm:max-w-md"
          />
          <USelect
            v-model="category"
            :items="categoryOptions"
            size="lg"
            class="w-full sm:w-52"
          />
        </div>

        <UAlert
          v-if="error"
          class="mt-8"
          color="error"
          title="Products could not be loaded"
          :description="getErrorMessage(error)"
        />

        <div v-if="status === 'pending'" class="grid grid-cols-2 gap-3 py-10 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <USkeleton v-for="item in 8" :key="item" class="aspect-[3/4] rounded-xl" />
        </div>

        <div v-else-if="filteredProducts.length" class="grid grid-cols-2 gap-3 py-10 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <UCard
            v-for="product in paginatedProducts"
            :key="product.id"
            class="overflow-hidden border-[#f2d7e1] bg-white"
            :ui="{ body: 'p-0 sm:p-0' }"
          >
            <NuxtLink :to="`/shop/${product.slug}`" class="block aspect-[4/5] overflow-hidden bg-[#fff5f8]">
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.name"
                class="size-full object-cover transition-transform duration-300 hover:scale-105"
              >
              <div v-else class="grid size-full place-items-center">
                <UIcon name="i-lucide-package" class="size-14 text-[#be124f]" />
              </div>
            </NuxtLink>
            <div class="p-5">
              <p class="text-xs font-medium text-[#be124f]">
                {{ product.category.name }}
              </p>
              <NuxtLink :to="`/shop/${product.slug}`" class="mt-1 block font-serif text-xl font-medium">
                {{ product.name }}
              </NuxtLink>
              <p class="mt-2 line-clamp-2 min-h-10 text-sm text-[#76505f]">
                {{ product.description }}
              </p>
              <div class="mt-5 flex items-center justify-between gap-3">
                <strong class="font-serif text-lg">{{ formatMoney(product.priceCents) }}</strong>
                <UButton
                  icon="i-lucide-plus"
                  square
                  variant="soft"
                  aria-label="Add product to cart"
                  :disabled="product.stock === 0"
                  @click="addProduct(product)"
                />
              </div>
            </div>
          </UCard>
        </div>

        <div v-if="filteredProducts.length > pageSize" class="flex justify-center border-t border-[#f2d7e1] py-8">
          <UPagination v-model:page="page" :items-per-page="pageSize" :total="filteredProducts.length" />
        </div>

        <div v-if="status !== 'pending' && !error && !filteredProducts.length" class="py-24 text-center">
          <UIcon name="i-lucide-package-search" class="mx-auto size-12 text-[#be124f]" />
          <h2 class="mt-4 font-serif text-2xl">
            No products found
          </h2>
          <p class="mt-2 text-[#76505f]">
            Try another search or category.
          </p>
          <UButton class="mt-5" variant="soft" @click="search = ''; category = 'all'">
            Clear filters
          </UButton>
        </div>
      </UContainer>
    </main>
  </div>
</template>
