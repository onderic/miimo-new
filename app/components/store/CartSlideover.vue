<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { items, totalCents, open, update, remove, clear } = useCart()
const pending = ref(false)
const error = ref('')
const completedOrderUrl = ref<string | null>(null)
const schema = z.object({
  customerName: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().trim().min(7, 'Enter a valid phone number'),
  deliveryAddress: z.string().trim().min(10, 'Enter your delivery address')
})
type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({ customerName: '', email: '', phone: '', deliveryAddress: '' })

async function placeOrder(event: FormSubmitEvent<Schema>) {
  pending.value = true
  error.value = ''
  try {
    const order = await $fetch('/api/store/orders', {
      method: 'POST',
      body: {
        ...event.data,
        items: items.value.map(item => ({ productId: item.product.id, quantity: item.quantity }))
      }
    })
    completedOrderUrl.value = `/order/success?reference=${encodeURIComponent(order.reference)}&total=${order.totalCents}`
    open.value = false
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
  } finally {
    pending.value = false
  }
}

async function afterCartClosed() {
  if (!completedOrderUrl.value) return

  const destination = completedOrderUrl.value
  completedOrderUrl.value = null
  clear()
  await navigateTo(destination)
}
</script>

<template>
  <USlideover
    v-model:open="open"
    side="right"
    title="Your cart"
    description="Review your items and complete your order."
    :ui="{ content: 'max-w-md' }"
    @after:leave="afterCartClosed"
  >
    <template #body>
      <div v-if="items.length" class="space-y-6">
        <div class="space-y-3">
          <UCard v-for="item in items" :key="item.product.id">
            <div class="flex gap-3">
              <img
                :src="item.product.imageUrl || ''"
                :alt="item.product.name"
                class="size-20 rounded-lg bg-[#fbedf1] object-cover"
              >
              <div class="min-w-0 flex-1">
                <h3 class="truncate font-medium">
                  {{ item.product.name }}
                </h3>
                <p class="text-sm text-muted">
                  {{ formatMoney(item.product.priceCents) }}
                </p>
                <div class="mt-3 flex items-center justify-between gap-3">
                  <UInputNumber
                    :model-value="item.quantity"
                    :min="1"
                    :max="item.product.stock"
                    size="sm"
                    class="w-28"
                    @update:model-value="value => update(item.product.id, value)"
                  />
                  <UButton
                    icon="i-lucide-trash"
                    color="error"
                    variant="ghost"
                    size="sm"
                    aria-label="Remove product"
                    @click="remove(item.product.id)"
                  />
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="placeOrder"
        >
          <h3 class="font-semibold">
            Delivery details
          </h3>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :description="error"
          />
          <UFormField label="Full name" name="customerName" required>
            <UInput v-model="state.customerName" autocomplete="name" class="w-full" />
          </UFormField>
          <UFormField label="Email" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              autocomplete="email"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Phone" name="phone" required>
            <UInput
              v-model="state.phone"
              type="tel"
              autocomplete="tel"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Delivery address" name="deliveryAddress" required>
            <UTextarea v-model="state.deliveryAddress" autocomplete="street-address" class="w-full" />
          </UFormField>
          <div class="flex justify-between border-t border-default pt-4 text-lg">
            <span>Total</span><strong>{{ formatMoney(totalCents) }}</strong>
          </div>
          <UButton
            type="submit"
            label="Place order"
            icon="i-lucide-check"
            block
            size="lg"
            :loading="pending"
          />
        </UForm>
      </div>

      <div v-else class="grid h-full place-items-center text-center">
        <div>
          <UIcon name="i-lucide-shopping-bag" class="mx-auto size-12 text-[#d6537a]" />
          <p class="mt-4 font-medium">
            Your cart is empty
          </p>
          <UButton
            to="/#shop"
            label="Browse products"
            variant="link"
            @click="open = false"
          />
        </div>
      </div>
    </template>
  </USlideover>
</template>
