import { createApp, watchEffect } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { authService, configureAuth } from '@/features/platform/auth'
import { useSettingsStore, useBranding } from '@/features/platform/settings'

// The auth feature in @241/platform is brand-neutral by contract — configured
// per app here, never forked.
configureAuth({
  appKey: 'PORTAL',
  appTitle: 'Portal 241',
  appSubtitle: 'MTs Persis 241 Al-Ikhlash',
  logoAlt: 'Logo MTs Persis 241 Al-Ikhlash',
  loginTitle: 'Masuk ke Portal 241',
})

// Restore the session from the HttpOnly refresh cookie before mounting so the
// auth gate reflects real session validity (no shell ⇄ login bounce).
void authService.restoreSession().finally(() => {
  const app = createApp(App as Component).use(store)

  // Fire-and-forget: first paint uses configureAuth's defaults above; this
  // overlays admin-configured branding once it resolves, with no loading gate
  // blocking the app shell.
  void useSettingsStore().fetchSettings('PORTAL')

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
