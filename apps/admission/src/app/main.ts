import { createApp } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { configureAuth } from '@/features/platform/auth'

configureAuth({
  appTitle: 'PSB 241',
  appSubtitle: 'Penerimaan Santri Baru',
  logoAlt: 'Logo PSB',
  loginTitle: 'Masuk ke Portal PSB',
})

createApp(App as Component)
  .use(store)
  .use(router)
  .mount('#app')
