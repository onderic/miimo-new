<script setup lang="ts">
definePageMeta({ layout: 'public' })
const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-[#fffbf8] text-[#2b1b20]">
    <UContainer class="grid min-h-[70vh] place-items-center py-16">
      <UCard class="w-full max-w-xl text-center">
        <UIcon name="i-lucide-circle-check-big" class="mx-auto size-16 text-success" />
        <h1 class="mt-5 font-serif text-3xl">
          Thank you for your order
        </h1>
        <p class="mt-3 text-muted">
          Your order reference is <strong>{{ route.query.reference }}</strong>.
        </p>
        <p class="mt-2 text-lg">
          Total: <strong>{{ formatMoney(Number(route.query.total || 0)) }}</strong>
        </p>
        <UButton to="/" label="Return home" class="mt-8 rounded-full" />
      </UCard>
    </UContainer>
  </div>
</template>
