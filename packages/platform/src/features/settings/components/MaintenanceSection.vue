<script setup lang="ts">
import { Textarea } from '@/ui/textarea'
import { Switch } from '@/ui/switch'
import { Separator } from '@/ui/separator'

const maintenanceMode = defineModel<boolean>('maintenanceMode', {
  required: true,
})
const maintenanceMessage = defineModel<string>('maintenanceMessage', {
  required: true,
})
</script>

<template>
  <div
    class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4"
  >
    <h3 class="text-lg font-bold text-foreground">Mode Pemeliharaan</h3>
    <Separator />
    <div class="flex items-center gap-3">
      <Switch
        :model-value="maintenanceMode"
        @update:model-value="(v) => (maintenanceMode = Boolean(v))"
      />
      <span class="text-sm">
        Aktifkan mode pemeliharaan (memblokir akses pengguna non-admin)
      </span>
    </div>
    <div class="space-y-1">
      <label class="text-sm font-semibold">Pesan Pemeliharaan</label>
      <Textarea
        v-model="maintenanceMessage"
        rows="2"
        placeholder="Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti."
      />
    </div>
  </div>
</template>
