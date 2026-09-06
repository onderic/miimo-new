<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Category } from '~/types'

const emit = defineEmits<{ created: [] }>()

const open = ref(false)
const toast = useToast()
const pending = ref(false)
const error = ref('')
const imageFile = ref<File>()
const imagePreview = ref('')

const { data: categories } = await useFetch<Category[]>('/api/categories', { default: () => [] })

const categoryItems = computed(() => {
  return categories.value.map(category => ({
    label: category.name,
    value: category.id
  }))
})

const statusItems = [{
  label: 'Draft',
  value: 'DRAFT'
}, {
  label: 'Active',
  value: 'ACTIVE'
}, {
  label: 'Archived',
  value: 'ARCHIVED'
}]

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(160, 'Name must be at most 160 characters'),
  slug: z.string().trim().min(2, 'Slug must be at least 2 characters').max(180, 'Slug must be at most 180 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes'),
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters').max(80, 'SKU must be at most 80 characters'),
  price: z.number().nonnegative('Enter a valid price'),
  stock: z.number().int('Stock must be a whole number').nonnegative('Stock cannot be negative'),
  description: z.string().trim().max(5000, 'Description must be at most 5000 characters').optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  categoryId: z.number().int().positive('Select a category')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
  slug: '',
  sku: '',
  price: undefined,
  stock: 0,
  description: '',
  status: 'DRAFT',
  categoryId: undefined
})

let slugTouched = false

function onSlugEdited() {
  slugTouched = true
}

watch(() => state.name, (name) => {
  if (name && !slugTouched) state.slug = slugify(name)
})

watch(open, (isOpen) => {
  if (!isOpen) reset()
})

function reset() {
  state.name = ''
  state.slug = ''
  state.sku = ''
  state.price = undefined
  state.stock = 0
  state.description = ''
  state.status = 'DRAFT'
  state.categoryId = undefined
  slugTouched = false
  error.value = ''
  imageFile.value = undefined
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = ''
}

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

onBeforeUnmount(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!imageFile.value) {
    error.value = 'Select a product image'
    return
  }

  pending.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('image', imageFile.value)
    const { url: imageUrl } = await $fetch('/api/uploads/images', { method: 'POST', body: formData })

    const product = await $fetch('/api/products', {
      method: 'POST',
      body: {
        name: event.data.name,
        slug: event.data.slug,
        sku: event.data.sku.toUpperCase(),
        priceCents: Math.round(event.data.price * 100),
        stock: event.data.stock,
        imageUrl,
        description: event.data.description?.trim() || null,
        status: event.data.status,
        categoryId: event.data.categoryId
      }
    })

    toast.add({ title: 'Product created', description: product.name, color: 'success' })
    emit('created')
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
    title="New product"
    description="Add a new product to your catalog."
  >
    <UButton label="New product" icon="i-lucide-plus" />

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

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormField
            label="Name"
            name="name"
            required
            class="sm:col-span-2"
          >
            <UInput v-model="state.name" class="w-full" placeholder="Running shoes" />
          </UFormField>

          <UFormField
            label="Slug"
            name="slug"
            hint="Auto-generated from the name."
            required
          >
            <UInput
              v-model="state.slug"
              class="w-full"
              placeholder="running-shoes"
              @update:model-value="onSlugEdited"
            />
          </UFormField>

          <UFormField label="SKU" name="sku" required>
            <UInput v-model="state.sku" class="w-full" placeholder="RS-001" />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <UFormField label="Price (KES)" name="price" required>
            <UInput
              v-model="state.price"
              type="number"
              min="0"
              step="0.01"
              class="w-full"
              placeholder="29.99"
            />
          </UFormField>

          <UFormField label="Stock" name="stock" required>
            <UInput
              v-model="state.stock"
              type="number"
              min="0"
              step="1"
              class="w-full"
              placeholder="0"
            />
          </UFormField>

          <UFormField label="Status" name="status" required>
            <USelect v-model="state.status" :items="statusItems" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Category" name="categoryId" required>
          <USelect
            v-model="state.categoryId"
            :items="categoryItems"
            placeholder="Select a category"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Product image" name="image">
          <img
            v-if="imagePreview"
            :src="imagePreview"
            alt="Selected product image"
            class="mb-3 aspect-video w-full rounded-lg border border-default object-cover"
          >
          <UInput
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="w-full"
            @change="selectImage"
          />
          <template #hint>
            Required. JPG, PNG, WebP, or GIF up to 5 MB.
          </template>
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="state.description"
            :rows="4"
            class="w-full"
            placeholder="Optional product description"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            label="Create product"
            color="primary"
            variant="solid"
            type="submit"
            :loading="pending"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
