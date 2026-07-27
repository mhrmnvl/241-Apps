<script setup lang="ts">
import { Input } from '@/ui/input'
import { Separator } from '@/ui/separator'

const contactEmail = defineModel<string>('contactEmail', { required: true })
const contactPhone = defineModel<string>('contactPhone', { required: true })
const footerText = defineModel<string>('footerText', { required: true })
</script>

<template>
  <div
    class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4"
  >
    <h3 class="text-lg font-bold text-foreground">Kontak & Footer</h3>
    <Separator />
    <div class="space-y-1">
      <label class="text-sm font-semibold">Email Kontak</label>
      <Input
        v-model="contactEmail"
        type="email"
      />
    </div>
    <div class="space-y-1">
      <label class="text-sm font-semibold">Telepon Kontak</label>
      <Input v-model="contactPhone" />
    </div>
    <div class="space-y-1">
      <label class="text-sm font-semibold">Teks Footer</label>
      <Input v-model="footerText" />
    </div>
  </div>
</template>
