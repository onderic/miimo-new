<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Analytics, OrderStatus, Period, Range } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

const UBadge = resolveComponent('UBadge')

type DashboardOrder = Analytics['recentOrders'][number]
const query = computed(() => ({ start: props.range.start.toISOString(), end: props.range.end.toISOString() }))
const { data: analytics } = await useFetch<Analytics>('/api/analytics', { query, watch: [query] })
const data = computed(() => analytics.value?.recentOrders ?? [])

const columns: TableColumn<DashboardOrder>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.original.reference
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString('en-KE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const color = ({
        PENDING: 'warning',
        CONFIRMED: 'info',
        FULFILLED: 'success',
        CANCELLED: 'error'
      } as const)[row.getValue('status') as OrderStatus]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        String(row.getValue('status')).toLowerCase()
      )
    }
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'totalCents',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) => {
      const amount = Number(row.getValue('totalCents')) / 100

      const formatted = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0
      }).format(amount)

      return h('div', { class: 'text-right font-medium' }, formatted)
    }
  }
]
</script>

<template>
  <UTable
    :data="data"
    :columns="columns"
    class="shrink-0"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default'
    }"
  />
</template>
