export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(cents / 100)
}

export function getErrorMessage(error: unknown): string {
  const fetchError = error as { data?: { statusMessage?: string, message?: string } }
  return fetchError.data?.statusMessage || fetchError.data?.message || 'Something went wrong, please try again.'
}
