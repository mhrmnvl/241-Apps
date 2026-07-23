<script setup lang="ts">
import { computed } from 'vue'
import { Wrench } from 'lucide-vue-next'
import { Button } from '@/ui/button'
import { useSettingsStore } from '../stores/settingsStore'

const settingsStore = useSettingsStore()

const message = computed(
  () =>
    settingsStore.settings?.maintenanceMessage ??
    'Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti.',
)
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-900"
  >
    <div
      class="flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50"
    >
      <div
        class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 ring-8 ring-amber-50/50"
      >
        <Wrench class="size-8" />
      </div>

      <h1 class="mb-2 text-xl font-bold text-slate-800">
        Sedang Dalam Pemeliharaan
      </h1>
      <p class="mb-8 text-sm leading-relaxed text-slate-500">
        {{ message }}
      </p>

      <RouterLink
        to="/login"
        class="w-full"
      >
        <Button class="h-11 w-full rounded-xl font-semibold shadow-md">
          Masuk sebagai Admin
        </Button>
      </RouterLink>
    </div>
  </div>
</template>
