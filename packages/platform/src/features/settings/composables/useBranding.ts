import { computed } from 'vue'
import { useSettingsStore } from '../stores/settingsStore'

/**
 * Resolves the currently-configured logo/favicon URLs, falling back to each
 * app's static public/ assets until the settings store has loaded (or if no
 * admin-uploaded asset exists yet). logoUrl/faviconUrl from the backend are
 * already-signed, time-limited URLs (the storage bucket is private) — used
 * as-is, never cached beyond the session.
 */
export function useBranding() {
  const store = useSettingsStore()

  const logoSrc = computed(() => store.settings?.logoUrl ?? '/logo.webp')

  const faviconSrc = computed(() => store.settings?.faviconUrl ?? '/vite.svg')

  return { logoSrc, faviconSrc }
}
