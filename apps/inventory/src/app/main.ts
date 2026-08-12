import { createApp, watchEffect } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { authService, configureAuth } from '@/features/platform/auth'
import { useSettingsStore, useBranding } from '@/features/platform/settings'

configureAuth({
  appKey: 'INVENTORY',
  appTitle: 'SIMAS 241',
  appSubtitle: 'Sistem Informasi Manajemen Aset',
  logoAlt: 'SIMAS Logo',
  loginTitle: 'Masuk ke SIMAS',
})

// Restore the session before mounting so the auth gate reflects real session
// validity (no dashboard ⇄ login bounce). The refresh cookie belongs to the
// API host, so this also picks up a session opened in a sibling app.
void authService.restoreSession().finally(() => {
  const app = createApp(App as Component).use(store)

  // Fire-and-forget: first paint uses configureAuth's hardcoded defaults
  // above; this overlays admin-configured branding once it resolves, with
  // no loading gate blocking the app shell.
  void useSettingsStore().fetchSettings('INVENTORY')

  const { faviconSrc } = useBranding()
  watchEffect(() => {
    const link =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
      document.head.appendChild(document.createElement('link'))
    link.rel = 'icon'
    link.href = faviconSrc.value
  })

  app.use(router).mount('#app')
})
