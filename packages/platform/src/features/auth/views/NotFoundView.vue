<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import { AlertTriangle } from 'lucide-vue-next'

/**
 * Content only — deliberately no app shell.
 *
 * The 404 is the one view that cannot be a child of the layout route: it must
 * render bare for signed-out visitors and inside the shell for signed-in ones,
 * and the catch-all is matched before any auth decision is made.
 *
 * That choice belongs to the host app, which owns both the shell and the route,
 * so it is made in the app's own `NotFoundPage`. This package neither names a
 * layout nor decides when one applies.
 */
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => Boolean(authStore.user))

function goHome() {
  if (isAuthenticated.value) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center justify-center text-center p-6',
      isAuthenticated ? 'h-[calc(100vh-10rem)]' : 'min-h-screen bg-background',
    ]"
  >
    <Card class="max-w-md w-full">
      <CardContent class="p-8 flex flex-col items-center">
        <div
          class="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-6 ring-8 ring-amber-50/50"
        >
          <AlertTriangle class="size-8" />
        </div>

        <h1 class="text-7xl font-extrabold tracking-tight mb-2">404</h1>
        <h2 class="text-xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
        <p class="text-sm text-muted-foreground mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah
          dipindahkan ke alamat lain.
        </p>

        <Button
          class="w-full font-semibold h-11 rounded-xl shadow-md transition-transform active:scale-[0.98]"
          @click="goHome"
        >
          Kembali ke Dashboard
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
