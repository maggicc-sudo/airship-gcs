// Simple toast notification (replaces ElMessage)
let toastTimer: number | null = null

export function showToast(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
  const existing = document.querySelector('.gcs-toast')
  if (existing) existing.remove()
  if (toastTimer) clearTimeout(toastTimer)

  const el = document.createElement('div')
  el.className = `gcs-toast gcs-toast-${type}`
  el.textContent = message
  document.body.appendChild(el)

  requestAnimationFrame(() => el.classList.add('show'))

  toastTimer = window.setTimeout(() => {
    el.classList.remove('show')
    setTimeout(() => el.remove(), 300)
  }, 2500)
}
