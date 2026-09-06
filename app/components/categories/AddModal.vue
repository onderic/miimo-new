<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{ created: [] }>()

const open = ref(false)
const toast = useToast()
const pending = ref(false)
const error = ref('')
const imageFile = ref<File>()

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(120, 'Slug must be at most 120 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers and dashes'
    ),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  active: z.boolean()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
  slug: '',
  description: '',
  active: true
})

let slugTouched = false

function onSlugEdited() {
  slugTouched = true
}

watch(
  () => state.name,
  (name) => {
    if (name && !slugTouched) state.slug = slugify(name)
  }
)

watch(open, (isOpen) => {
  if (!isOpen) reset()
})

function reset() {
  state.name = ''
  state.slug = ''
  state.description = ''
  state.active = true
  slugTouched = false
  error.value = ''
  imageFile.value = undefined
}

function selectImage(event: Event) {
  imageFile.value = (event.target as HTMLInputElement).files?.[0]
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  pending.value = true
  error.value = ''

  try {
    let imageUrl: string | null = null
    if (imageFile.value) {
      const formData = new FormData()
      formData.append('image', imageFile.value)
      const upload = await $fetch('/api/uploads/images', { method: 'POST', body: formData })
      imageUrl = upload.url
    }

    const category = await $fetch('/api/categories', {
      method: 'POST',
      body: {
        name: event.data.name,
        slug: event.data.slug,
        description: event.data.description?.trim() || null,
        imageUrl,
        active: event.data.active
      }
    })

    toast.add({
      title: 'Category created',
      description: category.name,
      color: 'success'
    })
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
    title="New category"
    description="Add a new category to your catalog."
  >
    <UButton label="New category" icon="i-lucide-plus" />

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

        <UFormField
          label="Name"
          name="name"
          placeholder="Shoes"
          required
        >
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField
          label="Slug"
          name="slug"
          hint="Auto-generated from the name, edit it for a custom URL."
          required
        >
          <UInput
            v-model="state.slug"
            class="w-full"
            leading-icon="i-lucide-link"
            placeholder="shoes"
            @update:model-value="onSlugEdited"
          />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea
            v-model="state.description"
            :rows="3"
            class="w-full"
            placeholder="Optional category description"
          />
        </UFormField>

        <UFormField label="Category image" name="image">
          <UInput
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="w-full"
            @change="selectImage"
          />
          <template #hint>
            JPG, PNG, WebP, or GIF up to 5 MB.
          </template>
        </UFormField>

        <UFormField label="Availability" name="active">
          <UCheckbox
            v-model="state.active"
            label="Active"
            description="Inactive categories are hidden from your storefront."
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
            label="Create category"
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
