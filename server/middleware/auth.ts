export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/') || path.startsWith('/api/auth/') || path.startsWith('/api/_auth/') || path.startsWith('/api/store/')) {
    return
  }

  await requireUserSession(event)
})
