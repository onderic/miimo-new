<script setup lang="ts">
const props = defineProps<{
  ids?: number[]
}>()

const emit = defineEmits<{ deleted: [] }>()

const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const pending = ref(false)
const error = ref('')

const count = computed(() => props.ids?.length ?? 0)

const title = computed(() => {
  return count.value <= 1 ? 'Delete product' : `Delete ${count.value} products`
})

async function confirmDelete() {
  const ids = props.ids ?? []
  if (!ids.length) return

  pending.value = true
  error.value = ''

  try {
    await Promise.all(ids.map(id => $fetch(`/api/products/${id}`, { method: 'DELETE' })))

    toast.add({
      title: count.value <= 1 ? 'Product deleted' : `${count.value} products deleted`,
      description: 'The products have been removed from your catalog.',
      color: 'success'
    })
    emit('deleted')
    open.value = false
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    description="Are you sure? This action cannot be undone."
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :description="error"
        />

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            label="Delete"
            color="error"
            variant="solid"
            :loading="pending"
            @click="confirmDelete"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
