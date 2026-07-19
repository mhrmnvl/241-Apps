<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
</script>

<template>
  <div class="animate-in fade-in zoom-in duration-500">
    <div
      class="flex flex-col items-center justify-center py-24 gap-6 text-center"
    >
      <div class="relative flex items-center justify-center">
        <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        <div class="bg-primary/10 p-4 rounded-full relative z-10">
          <Loader2 class="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-bold tracking-tight">
          Memproses Kenaikan Kelas
        </h3>
        <p class="text-muted-foreground max-w-[400px]">
          Mohon tunggu sebentar, sistem sedang memproses keputusan kenaikan
          kelas secara massal. Jangan tutup halaman ini.
        </p>
      </div>
    </div>
  </div>
</template>
