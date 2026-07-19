import { createApp } from 'vue'
import '@/style.css'
import App from '@/app/App.vue'
import router from '@/app/providers/router'
import store from '@/app/providers/store'
import type { Component } from 'vue'
import { setupProfileFeature } from '@/features/academic/profile/setup'

setupProfileFeature()

createApp(App as Component)
  .use(store)
  .use(router)
  .mount('#app')
