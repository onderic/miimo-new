<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { NewsletterSubscriber } from '~/types'

definePageMeta({ middleware: 'admin' })

const UBadge = resolveComponent('UBadge')
const table = useTemplateRef('table')
const search = ref('')
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const { data: subscribers, status, error } = await useFetch<NewsletterSubscriber[]>('/api/subscribers', {
  default: () => []
})

const filteredSubscribers = computed(() => {
  const term = search.value.trim().toLowerCase()
  return term ? subscribers.value.filter(subscriber => subscriber.email.includes(term)) : subscribers.value
})

const columns: TableColumn<NewsletterSubscriber>[] = [{
  accessorKey: 'email',
  header: 'Email',
  cell: ({ row }) => h('span', { class: 'font-medium text-highlighted' }, row.original.email)
}, {
  accessorKey: 'active',
  header: 'Status',
  cell: ({ row }) => h(UBadge, {
    color: row.original.active ? 'success' : 'neutral',
    variant: 'subtle'
  }, () => row.original.active ? 'Subscribed' : 'Unsubscribed')
}, {
  accessorKey: 'createdAt',
  header: 'Subscribed on',
  cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}]
</script>

<template>
  <UDashboardPanel id="subscribers">
    <template #header>
      <UDashboardNavbar title="Newsletter subscribers">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex items-center justify-between gap-3">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Filter subscribers..."
          class="w-full max-w-sm"
        />
        <UBadge color="primary" variant="subtle" size="lg">
          {{ filteredSubscribers.length }} subscribers
        </UBadge>
      </div>

      <UAlert
        v-if="error"
        color="error"
        title="Subscribers could not be loaded"
        :description="getErrorMessage(error)"
      />

      <UTable
        ref="table"
        v-model:pagination="pagination"
        :data="filteredSubscribers"
        :columns="columns"
        :loading="status === 'pending'"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        class="shrink-0"
        :ui="{ base: 'table-fixed border-separate border-spacing-0', thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none', tbody: '[&>tr]:last:[&>td]:border-b-0', th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r', td: 'border-b border-default', separator: 'h-0' }"
      />

      <div class="mt-auto flex items-center justify-between gap-3 border-t border-default pt-4">
        <p class="text-sm text-muted">
          {{ filteredSubscribers.length }} subscribers
        </p>
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="filteredSubscribers.length"
          @update:page="(page: number) => table?.tableApi?.setPageIndex(page - 1)"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
