export function formatDate(date: string) {
  const formatted = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return formatted.toLowerCase()
}
