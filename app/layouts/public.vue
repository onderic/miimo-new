<template>
  <div class="flex min-h-screen flex-col bg-[#fffafb] text-[#30151f]">
    <StoreHeader />
    <div class="flex-1">
      <slot />
    </div>
    <StoreFooter />
    <UButton
      href="https://wa.me/254769872557?text=Hello%20Miimo%2C%20I%20would%20like%20some%20help."
      target="_blank"
      rel="noopener noreferrer"
      icon="i-simple-icons-whatsapp"
      size="xl"
      color="success"
      square
      class="fixed right-4 bottom-4 z-40 rounded-full shadow-lg sm:right-6 sm:bottom-6"
      aria-label="Contact Miimo on WhatsApp"
    />
  </div>
</template>
