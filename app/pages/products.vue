<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Product, ProductStatus } from '~/types'

definePageMeta({ middleware: 'admin' })

const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const table = useTemplateRef('table')
const toast = useToast()
const search = ref('')
const statusFilter = ref<'all' | ProductStatus>('all')
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const deleteOpen = ref(false)
const productToDelete = ref<Product>()
const editOpen = ref(false)
const productToEdit = ref<Product>()

const { data: products, status, error, refresh } = await useFetch<Product[]>('/api/products', {
  default: () => []
})

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase()
  return products.value.filter(product => (
    (statusFilter.value === 'all' || product.status === statusFilter.value)
    && (!term || [product.name, product.sku, product.category.name]
      .some(value => value.toLowerCase().includes(term)))
  ))
})

async function updateStatus(product: Product) {
  try {
    await $fetch(`/api/products/${product.id}`, {
      method: 'PATCH',
      body: { status: product.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE' }
    })
    await refresh()
    toast.add({ title: 'Product updated', description: product.name, color: 'success' })
  } catch (requestError) {
    toast.add({ title: 'Could not update product', description: getErrorMessage(requestError), color: 'error' })
  }
}

const columns: TableColumn<Product>[] = [{
  accessorKey: 'name',
  header: 'Product',
  cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
    row.original.imageUrl
      ? h(UAvatar, { src: row.original.imageUrl, size: 'lg', square: true })
      : h('div', { class: 'grid size-9 place-items-center rounded-full bg-elevated ring-1 ring-default' }, [
          h('span', { class: 'i-lucide-package text-muted' })
        ]),
    h('div', undefined, [
      h('p', { class: 'font-medium text-highlighted' }, row.original.name),
      h('p', { class: 'font-mono text-xs text-muted' }, row.original.sku)
    ])
  ])
}, {
  accessorKey: 'category.name', header: 'Category'
}, {
  accessorKey: 'priceCents', header: 'Price', cell: ({ row }) => formatMoney(row.original.priceCents)
}, {
  accessorKey: 'stock', header: 'Stock', cell: ({ row }) => row.original.stock || 'Out of stock'
}, {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const colors = { DRAFT: 'neutral', ACTIVE: 'success', ARCHIVED: 'warning' } as const
    return h(UBadge, { variant: 'subtle', color: colors[row.original.status] }, () => row.original.status)
  }
}, {
  id: 'actions',
  cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, {
    content: { align: 'end' },
    items: [[{
      label: 'Edit product',
      icon: 'i-lucide-pencil',
      onSelect: () => {
        productToEdit.value = row.original
        editOpen.value = true
      }
    }, {
      label: row.original.status === 'ACTIVE' ? 'Archive product' : 'Activate product',
      icon: row.original.status === 'ACTIVE' ? 'i-lucide-eye-off' : 'i-lucide-eye',
      onSelect: () => updateStatus(row.original)
    }], [{
      label: 'Delete product',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: () => {
        productToDelete.value = row.original
        deleteOpen.value = true
      }
    }]]
  }, () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost' })))
}]
</script>

<template>
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar title="Products">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <ProductsAddModal @created="refresh" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Filter products..."
          class="max-w-sm"
        />
        <USelect
          v-model="statusFilter"
          :items="[
            { label: 'All', value: 'all' }, { label: 'Active', value: 'ACTIVE' },
            { label: 'Draft', value: 'DRAFT' }, { label: 'Archived', value: 'ARCHIVED' }
          ]"
          class="min-w-32"
        />
      </div>

      <UAlert
        v-if="error"
        color="error"
        title="Products could not be loaded"
        :description="getErrorMessage(error)"
      />

      <UTable
        ref="table"
        v-model:pagination="pagination"
        :data="filteredProducts"
        :columns="columns"
        :loading="status === 'pending'"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        class="shrink-0"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <p class="text-sm text-muted">
          {{ filteredProducts.length }} products
        </p>
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="filteredProducts.length"
          @update:page="(page: number) => table?.tableApi?.setPageIndex(page - 1)"
        />
      </div>
      <ProductsDeleteModal
        v-model:open="deleteOpen"
        :ids="productToDelete ? [productToDelete.id] : []"
        @deleted="refresh"
      />
      <ProductsEditModal
        v-model:open="editOpen"
        :product="productToEdit"
        @updated="refresh"
      />
    </template>
  </UDashboardPanel>
</template>
