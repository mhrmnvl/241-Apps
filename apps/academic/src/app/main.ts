import { createApp, watchEffect } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { setupProfileFeature } from '@/features/academic/profile/setup'
import { restoreSession } from '@/shared/utils/api'
import { configureAuth } from '@/features/platform/auth'
import { useSettingsStore, useBranding } from '@/features/platform/settings'

setupProfileFeature()

configureAuth({
  appKey: 'ACADEMIC',
  appTitle: 'SIAKAD 241',
  appSubtitle: 'Sistem Informasi Akademik',
  logoAlt: 'SIAKAD Logo',
  loginTitle: 'Masuk ke SIAKAD',
})

// Restore the session from the HttpOnly refresh cookie before mounting so the
// auth gate reflects real session validity (no dashboard ⇄ login bounce).
void restoreSession().finally(() => {
  const app = createApp(App as Component).use(store)

  // Fire-and-forget: first paint uses configureAuth's hardcoded defaults
  // above; this overlays admin-configured branding once it resolves, with
  // no loading gate blocking the app shell.
  void useSettingsStore().fetchSettings('ACADEMIC')

  const { faviconSrc, appTitle } = useBranding()
  watchEffect(() => {
    const link =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
      document.head.appendChild(document.createElement('link'))
    link.rel = 'icon'
    link.href = faviconSrc.value
  })

  watchEffect(() => {
    const routeTitle = router.currentRoute.value.meta.title as
      | string
      | undefined
    document.title = routeTitle
      ? `${routeTitle} — ${appTitle.value}`
      : appTitle.value
  })

  app.use(router).mount('#app')
})
