import { createApp } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { setupProfileFeature } from '@/features/academic/profile/setup'
import { restoreSession } from '@/shared/utils/api'

setupProfileFeature()

// Restore the session from the HttpOnly refresh cookie before mounting so the
// auth gate reflects real session validity (no dashboard ⇄ login bounce).
void restoreSession().finally(() => {
  createApp(App as Component)
    .use(store)
    .use(router)
    .mount('#app')
})
