<template>
  <footer id="contact" class="bg-[#30151f] pt-16 text-[#fff5f8]">
    <UContainer class="grid grid-cols-2 gap-10 md:grid-cols-4">
      <div class="col-span-2 md:col-span-1">
        <NuxtLink to="/" class="inline-flex items-center gap-2" aria-label="Miimo Natural home">
          <img src="/images/miimo/logo.webp" alt="Miimo" class="h-10 w-auto object-contain">
          <span class="font-serif text-xl font-semibold text-white">MiimoNatural</span>
        </NuxtLink>
        <p class="mt-4 max-w-60 text-sm text-[#fff5f8]/65">
          Natural hair care and skincare, thoughtfully made in Nairobi.
        </p>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-white">
          Shop
        </h3>
        <NuxtLink to="/shop" class="mt-3 block text-sm text-[#fff5f8]/75 hover:text-white">All products</NuxtLink>
        <NuxtLink to="/shop" class="mt-2 block text-sm text-[#fff5f8]/75 hover:text-white">Hair & skin care</NuxtLink>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-white">
          Learn
        </h3>
        <NuxtLink to="/#routine" class="mt-3 block text-sm text-[#fff5f8]/75 hover:text-white">Routines</NuxtLink>
        <NuxtLink to="/#philosophy" class="mt-2 block text-sm text-[#fff5f8]/75 hover:text-white">Our approach</NuxtLink>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-white">
          Contact
        </h3>
        <a
          href="https://wa.me/254769872557?text=Hello%20Miimo%2C%20I%20would%20like%20some%20help."
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 flex items-center gap-2 text-sm text-[#fff5f8]/75 hover:text-white"
        >
          <UIcon name="i-simple-icons-whatsapp" class="size-4 text-[#25d366]" />
          +254 769 872 557
        </a>
        <a href="mailto:miimonaturalproduct2025@gmail.com" class="mt-3 flex items-start gap-2 break-all text-sm text-[#fff5f8]/75 hover:text-white">
          <UIcon name="i-lucide-mail" class="mt-0.5 size-4 shrink-0" />
          miimonaturalproduct2025@gmail.com
        </a>
        <p class="mt-3 flex items-center gap-2 text-sm text-[#fff5f8]/75">
          <UIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
          Nairobi, Kenya
        </p>
      </div>
    </UContainer>

    <UContainer class="mt-14 flex flex-col justify-between gap-2 border-t border-white/15 py-7 text-xs text-[#fff5f8]/50 sm:flex-row">
      <span>© 2026 Miimo. All rights reserved.</span>
      <span>Natural care made in Kenya</span>
    </UContainer>
  </footer>
</template>
