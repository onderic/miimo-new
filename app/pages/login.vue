<script setup lang="ts">
definePageMeta({ layout: 'public' })

const route = useRoute()
const { user, fetch: fetchSession } = useUserSession()

const mode = ref<'login' | 'register'>('login')
const pending = ref(false)
const error = ref('')
const form = reactive({ name: '', email: '', password: '' })

async function submit() {
  pending.value = true
  error.value = ''

  try {
    await $fetch(`/api/auth/${mode.value}`, {
      method: 'POST',
      body: form
    })
    await fetchSession()

    const adminRedirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/dashboard'
    await navigateTo(user.value?.role === 'ADMIN' ? adminRedirect : '/')
  } catch (requestError) {
    const fetchError = requestError as { data?: { statusMessage?: string } }
    error.value = fetchError.data?.statusMessage || 'Unable to authenticate'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div>
    <main class="min-h-screen flex items-center justify-center bg-elevated/30 p-4">
      <UCard class="w-full max-w-md">
        <template #header>
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold">
              {{ mode === 'login' ? 'Welcome back' : 'Create your account' }}
            </h1>
            <p class="text-sm text-muted">
              {{ mode === 'login' ? 'Sign in to continue to your dashboard.' : 'Get started with your dashboard.' }}
            </p>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="submit">
          <UFormField v-if="mode === 'register'" label="Name" required>
            <UInput
              v-model="form.name"
              autocomplete="name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" required>
            <UInput
              v-model="form.email"
              type="email"
              autocomplete="email"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Password" hint="At least 8 characters" required>
            <UInput
              v-model="form.password"
              type="password"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              minlength="8"
              class="w-full"
            />
          </UFormField>

          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :description="error"
          />

          <UButton type="submit" block :loading="pending">
            {{ mode === 'login' ? 'Sign in' : 'Create account' }}
          </UButton>
        </form>

        <template #footer>
          <p class="text-center text-sm text-muted">
            {{ mode === 'login' ? 'Need an account?' : 'Already have an account?' }}
            <UButton
              color="neutral"
              variant="link"
              class="px-1"
              @click="mode = mode === 'login' ? 'register' : 'login'; error = ''"
            >
              {{ mode === 'login' ? 'Register' : 'Sign in' }}
            </UButton>
          </p>
        </template>
      </UCard>
    </main>
  </div>
</template>
