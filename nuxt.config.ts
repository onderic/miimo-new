// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@vueuse/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    storageKey: 'miimo-light-mode'
  },

  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 7
    }
  },

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          allowImportingTsExtensions: true
        }
      }
    }
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        allowImportingTsExtensions: true
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
