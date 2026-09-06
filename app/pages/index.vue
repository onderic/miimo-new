<script setup lang="ts">
import type { Product } from '~/types'

definePageMeta({ layout: 'public' })

const { add } = useCart()
const toast = useToast()
const shopTab = ref<'hair' | 'body'>('hair')
const routine = ref<'morning' | 'evening'>('morning')
const newsletterEmail = ref('')
const newsletterPending = ref(false)

const { data: storeProducts } = await useFetch<Product[]>('/api/store/products', { default: () => [] })
const products = computed(() => ({
  hair: storeProducts.value.filter(product => product.category.slug === 'haircare').slice(0, 4),
  body: storeProducts.value.filter(product => product.category.slug === 'body-care').slice(0, 4)
}))

function addProduct(product: Product) {
  add(product)
  toast.add({
    title: 'Added to cart',
    description: product.name,
    icon: 'i-lucide-circle-check',
    color: 'success'
  })
}

async function subscribe() {
  newsletterPending.value = true
  try {
    await $fetch('/api/store/newsletter', { method: 'POST', body: { email: newsletterEmail.value } })
    toast.add({ title: 'Thanks for subscribing.', icon: 'i-lucide-mail-check', color: 'success' })
    newsletterEmail.value = ''
  } catch (requestError) {
    toast.add({ title: 'Could not subscribe', description: getErrorMessage(requestError), color: 'error' })
  } finally {
    newsletterPending.value = false
  }
}

const routines = {
  morning: [
    ['Cleanse', 'Splash with lukewarm water, or use a gentle cleanser if needed.'],
    ['Rosewater Barrier Serum', 'Two pumps, pressed into damp skin to lock in hydration.'],
    ['Camellia Cream Veil', 'A pea-sized amount to seal moisture before makeup or SPF.'],
    ['Centella Eye Balm', 'Roll gently under eyes to de-puff and cool.']
  ],
  evening: [
    ['Double cleanse', 'Oil cleanser first to lift SPF and makeup, then a water-based rinse.'],
    ['Bakuchiol Night Polish', 'Apply every other night to start; nightly once skin adjusts.'],
    ['Rosewater Barrier Serum', 'Reapply to replenish anything lost during resurfacing.'],
    ['Camellia Cream Veil', 'A slightly thicker layer overnight to support repair.']
  ]
}

const ingredients = ['Rosa Damascena', 'Camellia Seed Oil', 'Niacinamide', 'Marula Oil', 'Bakuchiol', 'Centella Asiatica', 'Argan Kernel']

useSeoMeta({
  title: 'Miimo | Natural Hair Care & Body Products Made in Kenya — Nairobi',
  description: 'Shop natural, cruelty-free hair care, skincare, and body products made in Nairobi, Kenya.',
  ogImage: '/images/miimo/hero.webp'
})
useHead({
  meta: [{
    name: 'keywords',
    content: 'natural hair care Kenya, hair butter Nairobi, low porosity hair oil Kenya, sulfate free shampoo Kenya, natural skincare Kenya, made in Kenya beauty'
  }]
})
</script>

<template>
  <div class="landing">
    <main>
      <UContainer class="hero">
        <div class="hero-copy">
          <p class="eyebrow">
            <UIcon name="i-lucide-sparkles" />New — barrier-repair collection
          </p>
          <h1>Skin and hair, tended <em>the way</em> nature intended.</h1>
          <p class="lead">
            Small-batch skincare and haircare made with traceable botanicals, dermatologist-tested and formulated without fillers, sulfates, or guesswork.
          </p>
          <div class="hero-actions">
            <UButton
              to="/shop"
              size="xl"
              color="neutral"
              class="pill hero-shop-button"
            >
              Shop the collection
            </UButton>
            <UButton
              to="#routine"
              size="xl"
              color="neutral"
              variant="link"
            >
              Build your routine
            </UButton>
          </div>
          <div class="stats">
            <div><strong>92%</strong><span>saw visible change in 4 weeks</span></div>
            <div><strong>18</strong><span>active botanical extracts</span></div>
            <div><strong>0</strong><span>sulfates, parabens, dyes</span></div>
          </div>
        </div>
        <div class="hero-art">
          <div class="blob" />
          <img class="hero-main" src="/images/miimo/hero.webp" alt="Miimo natural hair care and body products">
          <img class="hero-small" src="/images/miimo/banner-body.webp" alt="Miimo natural body care products">
          <UCard class="tested">
            <UIcon name="i-lucide-badge-check" /><span><strong>Dermatologist tested</strong><small>Clinically verified</small></span>
          </UCard>
        </div>
      </UContainer>

      <div class="ingredient-strip">
        <div class="ingredient-track">
          <span v-for="(ingredient, index) in [...ingredients, ...ingredients]" :key="`${ingredient}-${index}`">
            <UIcon name="i-lucide-leaf" />{{ ingredient }}
          </span>
        </div>
      </div>

      <UContainer id="shop" class="section">
        <div class="section-head">
          <h2>Natural formulas for your hair and body.</h2>
          <p>Every product is batch-tested and listed with its full ingredient list — nothing hidden behind “fragrance.”</p>
        </div>
        <div class="tabs">
          <UButton
            icon="i-lucide-droplet"
            class="pill"
            :color="shopTab === 'hair' ? 'neutral' : 'neutral'"
            :variant="shopTab === 'hair' ? 'solid' : 'outline'"
            @click="shopTab = 'hair'"
          >
            Haircare
          </UButton>
          <UButton
            icon="i-lucide-waves"
            class="pill"
            color="neutral"
            :variant="shopTab === 'body' ? 'solid' : 'outline'"
            @click="shopTab = 'body'"
          >
            Body care
          </UButton>
        </div>
        <div class="product-grid">
          <UCard
            v-for="product in products[shopTab]"
            :key="product.name"
            class="product-card"
            :ui="{ body: 'p-0 sm:p-0' }"
          >
            <div class="product-visual">
              <NuxtLink :to="`/shop/${product.slug}`">
                <img :src="product.imageUrl || ''" :alt="product.name">
              </NuxtLink>
            </div>
            <div class="product-body">
              <p class="product-category">
                <UIcon name="i-lucide-leaf" />{{ product.category.name }}
              </p>
              <h3>{{ product.name }}</h3>
              <p>{{ product.description }}</p>
              <div class="product-foot">
                <strong>{{ formatMoney(product.priceCents) }}</strong>
                <UButton
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  class="round"
                  aria-label="Add product to cart"
                  :disabled="product.stock === 0"
                  @click="addProduct(product)"
                />
              </div>
            </div>
          </UCard>
        </div>
        <div class="mt-16 flex justify-center">
          <UButton
            to="/shop"
            label="View more products"
            trailing-icon="i-lucide-arrow-right"
            size="lg"
            class="pill"
          />
        </div>
      </UContainer>

      <section id="routine" class="routine-section">
        <UContainer class="routine-grid">
          <div>
            <h2>A routine that actually fits your morning.</h2>
            <p>Four steps, five minutes. Layer light to heavy, and let each formula finish absorbing before the next.</p>
            <div class="tabs">
              <UButton
                icon="i-lucide-sun"
                class="pill"
                color="neutral"
                :variant="routine === 'morning' ? 'soft' : 'outline'"
                @click="routine = 'morning'"
              >
                Morning
              </UButton>
              <UButton
                icon="i-lucide-moon"
                class="pill"
                color="neutral"
                :variant="routine === 'evening' ? 'soft' : 'outline'"
                @click="routine = 'evening'"
              >
                Evening
              </UButton>
            </div>
          </div>
          <ol class="steps">
            <li v-for="(step, index) in routines[routine]" :key="step[0]">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <div><h3>{{ step[0] }}</h3><p>{{ step[1] }}</p></div>
            </li>
          </ol>
        </UContainer>
      </section>

      <UContainer class="testimonial">
        <div class="stars">
          <UIcon v-for="star in 5" :key="star" name="i-lucide-star" />
        </div>
        <blockquote>“My scalp finally stopped itching after three weeks on the rosemary oil, and my sister asked what I was using on my skin without me saying a word.”</blockquote>
        <p><strong>Amara N.</strong> — Miimo customer since 2023</p>
      </UContainer>

      <section id="philosophy" class="philosophy">
        <UContainer class="philosophy-grid">
          <h2>We formulate backward — <em>from the skin,</em> not the shelf.</h2>
          <ul>
            <li><div><h3><UIcon name="i-lucide-badge-check" />Traceable sourcing</h3><p>Every botanical is sourced from named farms we’ve visited ourselves.</p></div><strong>100%</strong></li>
            <li><div><h3><UIcon name="i-lucide-flask-conical" />Independent lab testing</h3><p>Each batch is tested for purity before it ships, not just at launch.</p></div><strong>3rd</strong></li>
            <li><div><h3><UIcon name="i-lucide-recycle" />Recyclable packaging</h3><p>Glass and aluminum only — no mixed plastics that can’t be recycled.</p></div><strong>92%</strong></li>
          </ul>
        </UContainer>
      </section>

      <UContainer class="newsletter">
        <div><h2>Stay in the Miimo loop.</h2><p>Join the list for routine tips, early access to new formulas, and restock alerts.</p></div>
        <form @submit.prevent="subscribe">
          <UInput
            v-model="newsletterEmail"
            type="email"
            size="xl"
            placeholder="Your email address"
            class="email"
            required
          /><UButton
            type="submit"
            size="xl"
            color="neutral"
            class="pill dark-button"
            :loading="newsletterPending"
          >
            Subscribe
          </UButton>
        </form>
      </UContainer>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,450;0,9..144,560;1,9..144,450&family=Public+Sans:wght@400;500;600&display=swap');
.landing{--pink:#d6537a;--deep:#a83a5c;--soft:#f7dce4;--pale:#fbedf1;--cream:#fffbf8;--ink:#2b1b20;--muted:#6b5158;--line:#ebd9de;background:var(--cream);color:var(--ink);font-family:'Public Sans',sans-serif}.landing h1,.landing h2,.landing h3,.brand,.product-foot strong,.stats strong,.steps>li>span,.philosophy li>strong{font-family:'Fraunces',serif}.nav-shell{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--line);background:#fffbf8e8;backdrop-filter:blur(8px)}.nav-inner{display:flex;height:76px;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:9px;color:var(--deep);font-size:23px;font-style:italic;font-weight:560}.nav-links{display:flex;gap:36px;color:var(--muted);font-size:14px}.nav-links a:hover{color:var(--deep)}.nav-actions{display:flex;align-items:center;gap:8px}.pill{border-radius:999px}.hero-shop-button{background:var(--deep);color:white}.hero-shop-button:hover{background:#9d1647}.hero{display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:56px;padding-top:64px;padding-bottom:90px}.eyebrow{display:flex;align-items:center;gap:8px;color:var(--deep);font-size:14px;font-weight:500}.hero h1{max-width:570px;margin-top:18px;font-size:clamp(40px,5vw,60px);font-weight:450;line-height:1.06}.hero h1 em{color:var(--deep)}.lead{max-width:440px;margin-top:22px;color:var(--muted);font-size:17px;line-height:1.7}.hero-actions,.tabs{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}.dark-button{background:var(--ink);color:white}.stats{display:flex;gap:32px;max-width:480px;margin-top:46px;padding-top:28px;border-top:1px solid var(--line)}.stats strong{display:block;color:var(--deep);font-size:26px;font-weight:450}.stats span{display:block;color:var(--muted);font-size:12px}.hero-art{position:relative;aspect-ratio:1/1.05}.blob{position:absolute;inset:0;border-radius:42% 58% 63% 37%/41% 44% 56% 59%;background:linear-gradient(155deg,var(--soft),var(--pale) 60%,var(--cream));animation:morph 14s ease-in-out infinite}.hero-main,.hero-small{position:absolute;object-fit:cover;box-shadow:0 25px 55px -25px #a83a5c88}.hero-main{top:8%;left:10%;width:66%;aspect-ratio:4/5;border-radius:14px}.hero-small{right:4%;bottom:6%;width:42%;aspect-ratio:1;border:6px solid var(--cream);border-radius:12px}.tested{position:absolute;top:6%;right:2%;display:flex;align-items:center;gap:10px;color:var(--deep);border-radius:999px}.tested span,.tested strong,.tested small{display:block}.tested small{color:var(--muted);font-size:11px}.ingredient-strip{overflow:hidden;border-block:1px solid var(--line);background:white;padding:25px 0}.ingredient-track{display:flex;width:max-content;gap:44px;animation:scroll 32s linear infinite}.ingredient-track span{display:flex;align-items:center;gap:8px;color:var(--muted);font:italic 17px 'Fraunces',serif}.ingredient-track svg{color:var(--pink)}.section{padding-top:96px;padding-bottom:96px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:24px}.section-head h2,.routine-grid h2,.newsletter h2{max-width:500px;font-size:clamp(30px,3.4vw,42px);font-weight:450;line-height:1.18}.section-head p,.routine-grid>div>p,.newsletter p{max-width:360px;color:var(--muted)}.product-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:40px}.product-card{overflow:hidden;border-color:var(--line);border-radius:4px;background:white}.product-card:nth-child(even){transform:translateY(32px)}.product-visual{position:relative;overflow:hidden;aspect-ratio:4/5;background:var(--pale)}.product-visual img{width:100%;height:100%;object-fit:cover;transition:transform .5s}.product-card:hover img{transform:scale(1.04)}.product-tag{position:absolute;top:14px;left:14px;z-index:2}.product-body{padding:20px;border-top:1px solid var(--line)}.product-category{display:flex;align-items:center;gap:6px;color:var(--deep);font-size:12px}.product-body h3{margin-top:6px;font-size:18px;font-weight:450}.product-body>p:not(.product-category){min-height:42px;margin-top:6px;color:var(--muted);font-size:13px}.product-foot{display:flex;align-items:center;justify-content:space-between;margin-top:16px}.product-foot strong{font-size:17px}.round{border-radius:999px}.routine-section{border-block:1px solid var(--line);background:white}.routine-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:64px;padding-top:96px;padding-bottom:96px}.routine-grid>div>p{margin-top:18px}.steps li{display:flex;gap:22px;padding:22px 0;border-top:1px solid var(--line)}.steps li:last-child{border-bottom:1px solid var(--line)}.steps>li>span{width:34px;color:var(--pink);font-size:20px;font-style:italic}.steps h3{font-family:'Public Sans';font-size:16px;font-weight:600}.steps p{margin-top:4px;color:var(--muted);font-size:14px}.testimonial{max-width:820px!important;padding-top:110px;padding-bottom:110px;text-align:center}.stars{display:flex;justify-content:center;gap:4px;color:var(--pink)}.stars svg{fill:currentColor}.testimonial blockquote{margin-top:22px;font:italic 400 clamp(23px,3vw,32px)/1.4 'Fraunces',serif}.testimonial p{margin-top:28px;color:var(--muted);font-size:14px}.philosophy{background:var(--deep);color:white}.philosophy-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;padding-top:96px;padding-bottom:96px}.philosophy h2{font-size:clamp(30px,3.6vw,44px);font-weight:400;line-height:1.15}.philosophy h2 em{color:var(--pale)}.philosophy li{display:flex;justify-content:space-between;gap:24px;padding:22px 0;border-top:1px solid #ffffff38}.philosophy li:last-child{border-bottom:1px solid #ffffff38}.philosophy li h3{display:flex;align-items:center;gap:8px;font-family:'Public Sans';font-size:16px;font-weight:600}.philosophy li p{max-width:290px;margin-top:6px;color:var(--pale);font-size:14px}.philosophy li>strong{font-size:26px;font-style:italic}.newsletter{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:48px;padding-top:96px;padding-bottom:96px}.newsletter p{margin-top:14px}.newsletter form{display:flex;gap:10px}.email{flex:1}footer{background:var(--ink);color:var(--pale);padding-top:64px}.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:40px}.footer-brand{color:white}.footer-grid p{max-width:230px;margin-top:14px;color:#fbedf199;font-size:13px}.footer-grid h3{font-family:'Public Sans';font-size:13px;font-weight:600;color:white}.footer-grid a:not(.brand){display:block;margin-top:10px;color:#fbedf1bf;font-size:13px}.footer-bottom{display:flex;justify-content:space-between;margin-top:56px;padding-top:24px;padding-bottom:32px;border-top:1px solid #ffffff26;color:#fbedf180;font-size:12px}@keyframes morph{50%{border-radius:56% 44% 40% 60%/55% 40% 60% 45%}}@keyframes scroll{to{transform:translateX(-50%)}}@media(max-width:880px){.nav-links{display:none}.hero{grid-template-columns:1fr;padding-top:40px}.hero-art{order:-1;aspect-ratio:16/11}.product-grid{grid-template-columns:repeat(2,1fr)}.product-card:nth-child(even){transform:none}.routine-grid,.philosophy-grid,.newsletter{grid-template-columns:1fr}.footer-grid{grid-template-columns:1fr 1fr}}@media(max-width:520px){.nav-actions>button:first-child,.nav-actions>button:nth-child(2){display:none}.hero-art{aspect-ratio:1}.stats{gap:16px}.product-grid,.footer-grid{grid-template-columns:1fr}.newsletter form{flex-direction:column}.section-head{align-items:start;flex-direction:column}}@media(prefers-reduced-motion:reduce){.blob,.ingredient-track{animation:none}}
.landing{--pink:#f43f7f;--deep:#be124f;--soft:#ffe4ee;--pale:#fff5f8;--cream:#fffafb;--ink:#30151f;--muted:#76505f;--line:#f2d7e1}.nav-shell{background:#fffafbe8}.brand-logo{width:auto;height:40px;object-fit:contain}.hero-main,.hero-small{box-shadow:0 25px 55px -25px #be124f88}@media(max-width:520px){.product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.product-body{padding:14px}.product-body>p:not(.product-category){display:none}}
@media(max-width:640px){.hero{position:relative;isolation:isolate;display:block;min-height:430px;margin-top:0;padding:0 24px 32px;overflow:hidden;border-radius:0;background:url('/images/miimo/hero.webp') center 38%/cover no-repeat}.hero::before{position:absolute;z-index:-1;inset:0;background:linear-gradient(180deg,#30151f1f 15%,#30151f73 55%,#30151fe8 100%);content:''}.hero-copy{position:relative;z-index:1;display:flex;min-height:398px;flex-direction:column;justify-content:flex-end}.hero-art,.eyebrow,.stats,.ingredient-strip{display:none}.hero h1{max-width:330px;margin-top:0;color:white;font-size:34px}.hero h1 em{color:#ffe4ee}.lead{max-width:310px;margin-top:12px;color:#fff5f8;font-size:14px;line-height:1.5}.hero-actions{margin-top:18px}.hero-actions>:nth-child(2){display:none}.hero-actions .dark-button{background:white;color:#30151f}.section{padding-top:40px;padding-bottom:56px}.section-head p{display:none}.tabs{margin-top:20px}.product-grid{margin-top:24px}}
</style>
