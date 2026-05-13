function getRuntimeConfigValue(key) {
  if (typeof window === 'undefined') return undefined
  const value = window.__APP_CONFIG__?.[key]
  if (typeof value !== 'string') return undefined

  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

function getDefaultApiBaseUrl() {
  if (typeof window === 'undefined') return 'http://localhost:4000'

  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:4000'
  }

  // In production, prefer same-origin so HTTPS pages avoid mixed-content issues.
  return window.location.origin
}

export function getApiBaseUrl() {
  return getRuntimeConfigValue('VITE_API_BASE_URL')
    || import.meta.env.VITE_API_BASE_URL
    || getDefaultApiBaseUrl()
}

export function getRecaptchaSiteKey() {
  return getRuntimeConfigValue('VITE_RECAPTCHA_SITE_KEY')
    || import.meta.env.VITE_RECAPTCHA_SITE_KEY
}
