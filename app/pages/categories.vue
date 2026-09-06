<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Category } from '~/types'

definePageMeta({ middleware: 'admin' })

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UAvatar = resolveComponent('UAvatar')
const table = useTemplateRef('table')
const toast = useToast()
const search = ref('')
const activeFilter = ref<'all' | 'active' | 'inactive'>('all')
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const deleteOpen = ref(false)
const categoryToDelete = ref<Category>()
const editOpen = ref(false)
const categoryToEdit = ref<Category>()

const { data: categories, status, error, refresh } = await useFetch<Category[]>('/api/categories', {
  default: () => []
})

const filteredCategories = computed(() => {
  const term = search.value.trim().toLowerCase()
  return categories.value.filter(category => (
    (activeFilter.value === 'all' || category.active === (activeFilter.value === 'active'))
    && (!term || [category.name, category.slug].some(value => value.toLowerCase().includes(term)))
  ))
})

async function updateStatus(category: Category) {
  try {
    await $fetch(`/api/categories/${category.id}`, {
      method: 'PATCH',
      body: { active: !category.active }
    })
    await refresh()
    toast.add({ title: 'Category updated', description: category.name, color: 'success' })
  } catch (requestError) {
    toast.add({ title: 'Could not update category', description: getErrorMessage(requestError), color: 'error' })
  }
}

const columns: TableColumn<Category>[] = [{
  accessorKey: 'name',
  header: 'Category',
  cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
    row.original.imageUrl
      ? h(UAvatar, { src: row.original.imageUrl, size: 'lg', square: true })
      : h('div', { class: 'grid size-9 place-items-center rounded-full bg-elevated ring-1 ring-default' }, [
          h('span', { class: 'i-lucide-tags text-muted' })
        ]),
    h('div', undefined, [
      h('p', { class: 'font-medium text-highlighted' }, row.original.name),
      h('p', { class: 'text-xs text-muted line-clamp-1' }, row.original.description || 'No description')
    ])
  ])
}, {
  accessorKey: 'slug',
  header: 'Slug',
  cell: ({ row }) => h('span', { class: 'font-mono text-sm text-muted' }, `/${row.original.slug}`)
}, {
  id: 'products', header: 'Products', cell: ({ row }) => row.original._count?.products || 0
}, {
  accessorKey: 'active',
  header: 'Status',
  cell: ({ row }) => h(UBadge, {
    variant: 'subtle', color: row.original.active ? 'success' : 'neutral'
  }, () => row.original.active ? 'Active' : 'Inactive')
}, {
  id: 'actions',
  cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, {
    content: { align: 'end' },
    items: [[{
      label: 'Edit category',
      icon: 'i-lucide-pencil',
      onSelect: () => {
        categoryToEdit.value = row.original
        editOpen.value = true
      }
    }, {
      label: row.original.active ? 'Deactivate category' : 'Activate category',
      icon: row.original.active ? 'i-lucide-eye-off' : 'i-lucide-eye',
      onSelect: () => updateStatus(row.original)
    }], [{
      label: 'Delete category',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: () => {
        categoryToDelete.value = row.original
        deleteOpen.value = true
      }
    }]]
  }, () => h(UButton, { icon: 'i-lucide-ellipsis-vertical', color: 'neutral', variant: 'ghost' })))
}]
</script>

<template>
  <UDashboardPanel id="categories">
    <template #header>
      <UDashboardNavbar title="Categories">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <CategoriesAddModal @created="refresh" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Filter categories..."
          class="max-w-sm"
        />
        <USelect
          v-model="activeFilter"
          :items="[
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' }
          ]"
          class="min-w-32"
        />
      </div>

      <UAlert
        v-if="error"
        color="error"
        title="Categories could not be loaded"
        :description="getErrorMessage(error)"
      />

      <UTable
        ref="table"
        v-model:pagination="pagination"
        :data="filteredCategories"
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
          {{ filteredCategories.length }} categories
        </p>
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="filteredCategories.length"
          @update:page="(page: number) => table?.tableApi?.setPageIndex(page - 1)"
        />
      </div>

      <CategoriesDeleteModal
        v-model:open="deleteOpen"
        :ids="categoryToDelete ? [categoryToDelete.id] : []"
        @deleted="refresh"
      />
      <CategoriesEditModal
        v-model:open="editOpen"
        :category="categoryToEdit"
        @updated="refresh"
      />
    </template>
  </UDashboardPanel>
</template>
