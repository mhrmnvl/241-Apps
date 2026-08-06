<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from './AppLayout.vue'
import { NotFoundView, useAuthStore } from '@/features/platform/auth'

/**
 * Owns the one layout decision the router cannot make.
 *
 * Every other view reaches the shell by being a child of the layout route. The
 * 404 cannot: its catch-all is matched before auth is known, and a signed-out
 * visitor must get a bare page rather than a shell with an empty sidebar.
 *
 * The choice lives here, in the app, because the app owns the shell. Platform
 * only supplies the content.
 */
const authStore = useAuthStore()
const isAuthenticated = computed(() => Boolean(authStore.user))

const breadcrumbs = [
  { title: 'Error', href: '#' },
  { title: '404 Tidak Ditemukan', href: '#' },
]
</script>

<template>
  <AppLayout
    v-if="isAuthenticated"
    :breadcrumbs="breadcrumbs"
  >
    <NotFoundView />
  </AppLayout>
  <NotFoundView v-else />
</template>
