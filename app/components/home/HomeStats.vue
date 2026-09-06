<script setup lang="ts">
import type { Analytics, Period, Range, Stat } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0
  })
}

const query = computed(() => ({ start: props.range.start.toISOString(), end: props.range.end.toISOString() }))
const { data: analytics } = await useFetch<Analytics>('/api/analytics', { query, watch: [query] })

const stats = computed<(Stat & { to: string })[]>(() => [{
  title: 'Products', icon: 'i-lucide-package', value: analytics.value?.stats.products ?? 0, variation: 0, to: '/products'
}, {
  title: 'Categories', icon: 'i-lucide-tags', value: analytics.value?.stats.categories ?? 0, variation: 0, to: '/categories'
}, {
  title: 'Revenue', icon: 'i-lucide-circle-dollar-sign', value: formatCurrency((analytics.value?.stats.revenue ?? 0) / 100), variation: analytics.value?.stats.revenueVariation ?? 0, to: '/orders'
}, {
  title: 'Orders', icon: 'i-lucide-shopping-cart', value: analytics.value?.stats.orders ?? 0, variation: analytics.value?.stats.ordersVariation ?? 0, to: '/orders'
}])
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      :to="stat.to"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>

        <UBadge
          :color="stat.variation > 0 ? 'success' : stat.variation < 0 ? 'error' : 'neutral'"
          variant="subtle"
          class="text-xs"
        >
          {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}%
        </UBadge>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
