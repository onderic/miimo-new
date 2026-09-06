<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Category } from '~/types'

const props = defineProps<{ category?: Category }>()
const emit = defineEmits<{ updated: [] }>()
const open = defineModel<boolean>('open', { default: false })
const toast = useToast()
const pending = ref(false)
const error = ref('')
const imageFile = ref<File>()
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().max(1000).optional(),
  active: z.boolean()
})
type Schema = z.output<typeof schema>
const state = reactive<Schema>({ name: '', slug: '', description: '', active: true })

watch([open, () => props.category], ([isOpen, category]) => {
  if (!isOpen || !category) return
  Object.assign(state, {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    active: category.active
  })
  imageFile.value = undefined
  error.value = ''
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.category) return
  pending.value = true
  error.value = ''

  try {
    let imageUrl = props.category.imageUrl
    if (imageFile.value) {
      const body = new FormData()
      body.append('image', imageFile.value)
      imageUrl = (await $fetch('/api/uploads/images', { method: 'POST', body })).url
    }
    await $fetch(`/api/categories/${props.category.id}`, {
      method: 'PATCH',
      body: { ...event.data, description: event.data.description || null, imageUrl }
    })
    toast.add({ title: 'Category updated', description: event.data.name, color: 'success' })
    emit('updated')
    open.value = false
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Edit category" description="Update this category's details.">
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :description="error"
        />
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="Slug" name="slug" required>
          <UInput v-model="state.slug" class="w-full" />
        </UFormField>
        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" class="w-full" />
        </UFormField>
        <UFormField label="Replace image" name="image">
          <UInput
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="w-full"
            @change="imageFile = ($event.target as HTMLInputElement).files?.[0]"
          />
        </UFormField>
        <UFormField label="Availability" name="active">
          <UCheckbox v-model="state.active" label="Active" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton label="Save changes" type="submit" :loading="pending" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
