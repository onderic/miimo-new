<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Order, OrderStatus } from '~/types'

definePageMeta({ middleware: 'admin' })

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const table = useTemplateRef('table')
const toast = useToast()
const search = ref('')
const statusFilter = ref<'all' | OrderStatus>('all')
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const { data: orders, status, error, refresh } = await useFetch<Order[]>('/api/orders', { default: () => [] })

const filteredOrders = computed(() => {
  const term = search.value.trim().toLowerCase()
  return orders.value.filter(order => (
    (statusFilter.value === 'all' || order.status === statusFilter.value)
    && (!term || [order.reference, order.customerName, order.email].some(value => value.toLowerCase().includes(term)))
  ))
})

async function setStatus(order: Order, nextStatus: OrderStatus) {
  try {
    await $fetch(`/api/orders/${order.id}`, { method: 'PATCH', body: { status: nextStatus } })
    await refresh()
    toast.add({ title: 'Order updated', description: `${order.reference} is now ${nextStatus.toLowerCase()}.`, color: 'success' })
  } catch (requestError) {
    toast.add({ title: 'Could not update order', description: getErrorMessage(requestError), color: 'error' })
  }
}

const columns: TableColumn<Order>[] = [{
  accessorKey: 'reference',
  header: 'Order',
  cell: ({ row }) => h('div', undefined, [
    h('p', { class: 'font-mono font-medium text-highlighted' }, row.original.reference),
    h('p', { class: 'text-xs text-muted' }, new Date(row.original.createdAt).toLocaleString('en-KE'))
  ])
}, {
  accessorKey: 'customerName',
  header: 'Customer',
  cell: ({ row }) => h('div', undefined, [
    h('p', { class: 'font-medium text-highlighted' }, row.original.customerName),
    h('p', { class: 'text-xs text-muted' }, row.original.email)
  ])
}, {
  id: 'items', header: 'Items', cell: ({ row }) => row.original.items.reduce((total, item) => total + item.quantity, 0)
}, {
  accessorKey: 'totalCents', header: 'Total', cell: ({ row }) => formatMoney(row.original.totalCents)
}, {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const colors = { PENDING: 'warning', CONFIRMED: 'info', FULFILLED: 'success', CANCELLED: 'error' } as const
    return h(UBadge, { variant: 'subtle', color: colors[row.original.status] }, () => row.original.status)
  }
}, {
  id: 'actions',
  cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, {
    content: { align: 'end' },
    items: [[
      { label: 'Confirm', icon: 'i-lucide-circle-check', disabled: row.original.status === 'CONFIRMED', onSelect: () => setStatus(row.original, 'CONFIRMED') },
      { label: 'Mark fulfilled', icon: 'i-lucide-package-check', disabled: row.original.status === 'FULFILLED', onSelect: () => setStatus(row.original, 'FULFILLED') }
    ], [{ label: 'Cancel order', icon: 'i-lucide-circle-x', color: 'error', disabled: row.original.status === 'CANCELLED', onSelect: () => setStatus(row.original, 'CANCELLED') }]]
  }, () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost' })))
}]
</script>

<template>
  <UDashboardPanel id="orders">
    <template #header>
      <UDashboardNavbar title="Orders">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Filter orders..."
          class="max-w-sm"
        />
        <USelect v-model="statusFilter" :items="[{ label: 'All', value: 'all' }, { label: 'Pending', value: 'PENDING' }, { label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Fulfilled', value: 'FULFILLED' }, { label: 'Cancelled', value: 'CANCELLED' }]" class="min-w-36" />
      </div>
      <UAlert
        v-if="error"
        color="error"
        title="Orders could not be loaded"
        :description="getErrorMessage(error)"
      />
      <UTable
        ref="table"
        v-model:pagination="pagination"
        :data="filteredOrders"
        :columns="columns"
        :loading="status === 'pending'"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        class="shrink-0"
        :ui="{ base: 'table-fixed border-separate border-spacing-0', thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none', tbody: '[&>tr]:last:[&>td]:border-b-0', th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r', td: 'border-b border-default', separator: 'h-0' }"
      />
      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <p class="text-sm text-muted">
          {{ filteredOrders.length }} orders
        </p>
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="filteredOrders.length"
          @update:page="(page: number) => table?.tableApi?.setPageIndex(page - 1)"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
