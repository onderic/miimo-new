<script setup lang="ts">
const route = useRoute()

const color = '#e11d63'
const siteUrl = 'https://mimonatural.com'
const canonicalUrl = computed(() => `${siteUrl}${route.path === '/' ? '/' : route.path}`)
const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  'name': 'Miimo Natural Products',
  'url': siteUrl,
  'logo': `${siteUrl}/images/miimo/logo.webp`,
  'description': 'Miimo crafts natural, cruelty-free hair care and skincare products in Nairobi, Kenya.',
  'email': 'miimonaturalproduct2025@gmail.com',
  'telephone': '+254769872557',
  'address': { '@type': 'PostalAddress', 'addressLocality': 'Nairobi', 'addressCountry': 'KE' },
  'sameAs': [
    'https://www.facebook.com/miimonaturalproduct',
    'https://www.instagram.com/Miimo_care',
    'https://www.tiktok.com/@miimonaturalproduct',
    'https://wa.me/254769872557'
  ]
}

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
    { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
    { name: 'author', content: 'Miimo Natural Products' },
    { name: 'geo.region', content: 'KE-110' },
    { name: 'geo.placename', content: 'Nairobi, Kenya' },
    { name: 'geo.position', content: '-1.286389;36.817223' }
  ],
  link: [
    { rel: 'icon', type: 'image/webp', href: '/images/miimo/icon.webp' },
    { rel: 'apple-touch-icon', href: '/images/miimo/icon.webp' },
    { rel: 'canonical', href: canonicalUrl }
  ],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(organization) }],
  htmlAttrs: {
    lang: 'en-KE',
    class: 'light'
  }
})

const title = 'Miimo | Natural Hair Care & Body Products Made in Kenya'
const description = 'Miimo crafts natural hair care and skincare in Nairobi, Kenya. Shop hair oils, sulfate-free shampoo, hair butter, masks, and body care.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogSiteName: 'Miimo Natural Products',
  ogLocale: 'en_KE',
  ogUrl: canonicalUrl,
  ogImage: `${siteUrl}/images/miimo/hero.webp`,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: `${siteUrl}/images/miimo/hero.webp`
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <StoreCartSlideover />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
