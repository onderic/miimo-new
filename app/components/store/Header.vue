<script setup lang="ts">
import type { CategorySummary } from '~/types'

const { loggedIn } = useUserSession()
const { count, open } = useCart()
const route = useRoute()
const mobileOpen = ref(false)
const shopActive = computed(() => route.path.startsWith('/shop') && !route.query.category)
const categoriesActive = computed(() => route.path === '/shop' && typeof route.query.category === 'string')

const links = computed(() => [{
  label: loggedIn.value ? 'Dashboard' : 'Sign in',
  to: loggedIn.value ? '/dashboard' : '/login'
}])
const { data: categories } = await useFetch<CategorySummary[]>('/api/store/categories', { default: () => [] })
const categoryItems = computed(() => categories.value.map(category => ({
  label: category.name,
  icon: 'i-lucide-tag',
  to: `/shop?category=${category.slug}`,
  active: route.query.category === category.slug
})))
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-[#f2d7e1] bg-[#fffafb]/90 backdrop-blur">
    <UContainer class="flex h-18 items-center justify-between gap-4">
      <NuxtLink to="/" aria-label="Miimo Natural home" class="flex items-center gap-2 text-xl font-semibold text-[#be124f]">
        <img src="/images/miimo/logo.webp" alt="Miimo" class="h-10 w-auto object-contain">
        <span>MiimoNatural</span>
      </NuxtLink>
      <nav class="hidden items-center gap-7 text-sm text-[#76505f] lg:flex" aria-label="Main navigation">
        <NuxtLink to="/" class="transition-colors hover:text-[#be124f]" :class="route.path === '/' ? 'font-semibold text-[#be124f]' : ''">Home</NuxtLink>
        <NuxtLink to="/shop" class="transition-colors hover:text-[#be124f]" :class="shopActive ? 'font-semibold text-[#be124f]' : ''">Shop</NuxtLink>
        <UDropdownMenu :items="categoryItems" :content="{ align: 'start' }">
          <UButton
            label="Categories"
            trailing-icon="i-lucide-chevron-down"
            color="neutral"
            variant="link"
            class="p-0 font-normal hover:text-[#be124f]"
            :class="categoriesActive ? 'font-semibold text-[#be124f]' : 'text-[#76505f]'"
          />
        </UDropdownMenu>
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="transition-colors hover:text-[#be124f]"
          :class="route.path === link.to ? 'font-semibold text-[#be124f]' : ''"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="flex items-center gap-1 sm:gap-2">
        <UChip :text="count || undefined" color="primary" size="2xl">
          <UButton
            icon="i-lucide-shopping-cart"
            color="neutral"
            variant="ghost"
            aria-label="Open cart"
            @click="open = true"
          />
        </UChip>
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          :variant="route.path === '/' ? 'soft' : 'ghost'"
          aria-label="Open navigation"
          class="lg:hidden"
          @click="mobileOpen = true"
        />
      </div>
    </UContainer>
  </header>

  <USlideover v-model:open="mobileOpen" title="Menu" side="right">
    <template #body>
      <nav class="flex flex-col gap-2" aria-label="Mobile navigation">
        <UButton
          to="/"
          label="Home"
          icon="i-lucide-house"
          color="neutral"
          :variant="route.path === '/' ? 'soft' : 'ghost'"
          block
          class="justify-start"
          @click="mobileOpen = false"
        />
        <UButton
          to="/shop"
          label="Shop"
          icon="i-lucide-store"
          color="neutral"
          :variant="shopActive ? 'soft' : 'ghost'"
          block
          class="justify-start"
          @click="mobileOpen = false"
        />
        <p class="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Categories
        </p>
        <UButton
          v-for="category in categories"
          :key="category.id"
          :to="`/shop?category=${category.slug}`"
          :label="category.name"
          icon="i-lucide-tag"
          color="neutral"
          :variant="route.query.category === category.slug ? 'soft' : 'ghost'"
          block
          class="justify-start"
          @click="mobileOpen = false"
        />
        <USeparator class="my-2" />
        <UButton
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          :label="link.label"
          color="neutral"
          :variant="route.path === link.to ? 'soft' : 'ghost'"
          block
          class="justify-start"
          @click="mobileOpen = false"
        />
      </nav>
    </template>
  </USlideover>
</template>
