import { createApp, watchEffect } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { authService, configureAuth } from '@/features/platform/auth'
import { useSettingsStore, useBranding } from '@/features/platform/settings'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from '@/features/platform/reference-data'

configureAuth({
  appKey: 'PRESENCE',
  appTitle: 'SIPRES 241',
  appSubtitle: 'Sistem Informasi Presensi & Penggajian',
  logoAlt: 'SIPRES Logo',
  loginTitle: 'Masuk ke SIPRES',
})

// Restore the session before mounting so the auth gate reflects real session
// validity (no dashboard ⇄ login bounce). The refresh cookie belongs to the
// API host, so this also picks up a session opened in a sibling app.
void authService.restoreSession().finally(() => {
  // The client is created in @241/platform rather than left to the plugin's
  // default, so that services — which are plain objects, not components — can
  // reach it without Vue's inject. Components may still `useQuery`; it is the
  // same instance behind both.
  const app = createApp(App as Component)
    .use(store)
    .use(VueQueryPlugin, { queryClient })

  // Fire-and-forget: first paint uses configureAuth's hardcoded defaults
  // above; this overlays admin-configured branding once it resolves, with
  // no loading gate blocking the app shell.
  void useSettingsStore().fetchSettings('PRESENCE')

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
