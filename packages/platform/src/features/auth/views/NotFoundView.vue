<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/ui/button'
import { AlertTriangle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => Boolean(authStore.user))

const breadcrumbs = [
  { title: 'Error', href: '#' },
  { title: '404 Tidak Ditemukan', href: '#' },
]

function goHome() {
  if (isAuthenticated.value) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <component
    :is="isAuthenticated ? AppLayout : 'div'"
    v-bind="isAuthenticated ? { breadcrumbs } : {}"
  >
    <div
      :class="[
        'flex flex-col items-center justify-center text-center p-6',
        isAuthenticated
          ? 'h-[calc(100vh-10rem)]'
          : 'min-h-screen bg-slate-50 text-slate-900',
      ]"
    >
      <div
        class="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center"
      >
        <div
          class="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-6 ring-8 ring-amber-50/50"
        >
          <AlertTriangle class="size-8" />
        </div>

        <h1 class="text-7xl font-extrabold tracking-tight text-slate-900 mb-2">
          404
        </h1>
        <h2 class="text-xl font-bold text-slate-800 mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <p class="text-sm text-slate-500 mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah
          dipindahkan ke alamat lain.
        </p>

        <Button
          class="w-full font-semibold h-11 rounded-xl shadow-md transition-transform active:scale-[0.98]"
          @click="goHome"
        >
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  </component>
</template>
