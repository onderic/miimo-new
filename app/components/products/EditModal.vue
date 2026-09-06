<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Category, Product } from '~/types'

const props = defineProps<{ product?: Product }>()
const emit = defineEmits<{ updated: [] }>()
const open = defineModel<boolean>('open', { default: false })
const toast = useToast()
const pending = ref(false)
const error = ref('')
const imageFile = ref<File>()
const imagePreview = ref('')
const { data: categories } = await useFetch<Category[]>('/api/categories', { default: () => [] })

const schema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  sku: z.string().trim().min(2).max(80),
  price: z.number().nonnegative('Enter a valid price'),
  stock: z.number().int('Stock must be a whole number').nonnegative('Stock cannot be negative'),
  description: z.string().max(5000).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  categoryId: z.number().int().positive('Select a category')
})
type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  name: '', slug: '', sku: '', price: 0, stock: 0, description: '', status: 'DRAFT', categoryId: 0
})

watch([open, () => props.product], ([isOpen, product]) => {
  if (!isOpen || !product) return
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
  Object.assign(state, {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.priceCents / 100,
    stock: product.stock,
    description: product.description || '',
    status: product.status,
    categoryId: product.categoryId
  })
  imageFile.value = undefined
  imagePreview.value = product.imageUrl || ''
  error.value = ''
}, { immediate: true })

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

onBeforeUnmount(() => {
  if (imagePreview.value.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.product) return
  pending.value = true
  error.value = ''

  try {
    let imageUrl = props.product.imageUrl
    if (imageFile.value) {
      const body = new FormData()
      body.append('image', imageFile.value)
      imageUrl = (await $fetch('/api/uploads/images', { method: 'POST', body })).url
    }

    await $fetch(`/api/products/${props.product.id}`, {
      method: 'PATCH',
      body: {
        name: event.data.name,
        slug: event.data.slug,
        sku: event.data.sku.toUpperCase(),
        priceCents: Math.round(event.data.price * 100),
        stock: event.data.stock,
        description: event.data.description || null,
        imageUrl,
        status: event.data.status,
        categoryId: event.data.categoryId
      }
    })
    toast.add({ title: 'Product updated', description: event.data.name, color: 'success' })
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
  <UModal v-model:open="open" title="Edit product" description="Update this product's catalog details.">
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
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Name" name="name" required>
            <UInput v-model="state.name" class="w-full" />
          </UFormField>
          <UFormField label="SKU" name="sku" required>
            <UInput v-model="state.sku" class="w-full" />
          </UFormField>
          <UFormField label="Slug" name="slug" required>
            <UInput v-model="state.slug" class="w-full" />
          </UFormField>
          <UFormField label="Category" name="categoryId" required>
            <USelect v-model="state.categoryId" :items="categories.map(item => ({ label: item.name, value: item.id }))" class="w-full" />
          </UFormField>
          <UFormField label="Price (KES)" name="price" required>
            <UInput
              v-model="state.price"
              type="number"
              min="0"
              step="0.01"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Stock" name="stock" required>
            <UInput
              v-model="state.stock"
              type="number"
              min="0"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="Status" name="status">
          <USelect v-model="state.status" :items="['DRAFT', 'ACTIVE', 'ARCHIVED']" class="w-full" />
        </UFormField>
        <UFormField label="Replace image" name="image">
          <img
            v-if="imagePreview"
            :src="imagePreview"
            alt="Product image preview"
            class="mb-3 aspect-video w-full rounded-lg border border-default object-cover"
          >
          <UInput
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="w-full"
            @change="selectImage"
          />
        </UFormField>
        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" class="w-full" />
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
