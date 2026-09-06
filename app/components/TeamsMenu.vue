<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <UButton
    to="/"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    :aria-label="collapsed ? 'Miimo dashboard' : undefined"
    class="justify-start py-2"
  >
    <img src="/images/miimo/icon.webp" alt="" class="size-7 shrink-0 rounded-md object-contain">
    <span v-if="!collapsed" class="truncate text-base font-semibold text-[#be124f]">Miimo</span>
  </UButton>
</template>
