<script setup lang="ts">
const { user, clear: clearSession } = useUserSession()

const open = ref(false)

const links = computed(() => [{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/dashboard',
  onSelect: () => {
    open.value = false
  }
}, ...(user.value?.role === 'ADMIN'
  ? [{
      label: 'Products',
      icon: 'i-lucide-package',
      to: '/products',
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Categories',
      icon: 'i-lucide-tags',
      to: '/categories',
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Orders',
      icon: 'i-lucide-clipboard-list',
      to: '/orders',
      onSelect: () => {
        open.value = false
      }
    }, {
      label: 'Subscribers',
      icon: 'i-lucide-mails',
      to: '/subscribers',
      onSelect: () => {
        open.value = false
      }
    }]
  : [])])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value
}])

async function logout() {
  await clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="space-y-1">
          <UserMenu :collapsed="collapsed" />
          <UButton
            icon="i-lucide-log-out"
            :label="collapsed ? undefined : 'Log out'"
            color="error"
            variant="ghost"
            block
            :square="collapsed"
            aria-label="Log out"
            @click="logout"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
