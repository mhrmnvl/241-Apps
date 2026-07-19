import { createApp } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { configureAuth } from '@/features/platform/auth'
import { restoreSession } from '@/shared/utils/api'

configureAuth({
  appTitle: 'SIMAS 241',
  appSubtitle: 'Sistem Informasi Manajemen Aset',
  logoAlt: 'SIMAS Logo',
  loginTitle: 'Masuk ke SIMAS',
})

// Restore the session from the HttpOnly refresh cookie before mounting so the
// auth gate reflects real session validity (no dashboard ⇄ login bounce).
void restoreSession().finally(() => {
  createApp(App as Component)
    .use(store)
    .use(router)
    .mount('#app')
})
