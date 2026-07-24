import { createApp, watchEffect } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { configureAuth } from '@/features/platform/auth'
import { useSettingsStore, useBranding } from '@/features/platform/settings'
import { restoreSession } from '@/shared/utils/api'

configureAuth({
  appKey: 'ADMISSION',
  appTitle: 'PSB 241',
  appSubtitle: 'Penerimaan Santri Baru',
  logoAlt: 'Logo PSB',
  loginTitle: 'Masuk ke Portal PSB',
})

// Restore the session from the HttpOnly refresh cookie before mounting so the
// auth gate reflects real session validity (no dashboard ⇄ login bounce).
void restoreSession().finally(() => {
  const app = createApp(App as Component).use(store)

  // Fire-and-forget: first paint uses configureAuth's hardcoded defaults
  // above; this overlays admin-configured branding once it resolves, with
  // no loading gate blocking the app shell.
  void useSettingsStore().fetchSettings('ADMISSION')

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
