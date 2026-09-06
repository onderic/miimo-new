export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (to.path === '/' || to.path.startsWith('/shop') || to.path.startsWith('/order/')) return

  if (to.path === '/login') {
    if (loggedIn.value) return navigateTo(user.value?.role === 'ADMIN' ? '/dashboard' : '/')
    return
  }

  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
