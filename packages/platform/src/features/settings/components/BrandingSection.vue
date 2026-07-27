<script setup lang="ts">
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Separator } from '@/ui/separator'

const appTitle = defineModel<string>('appTitle', { required: true })
const appSubtitle = defineModel<string>('appSubtitle', { required: true })
const loginTitle = defineModel<string>('loginTitle', { required: true })
const metaDescription = defineModel<string>('metaDescription', {
  required: true,
})
</script>

<template>
  <div
    class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4"
  >
    <h3 class="text-lg font-bold text-foreground">Branding</h3>
    <Separator />
    <div class="space-y-1">
      <label class="text-sm font-semibold">Nama Aplikasi</label>
      <Input
        v-model="appTitle"
        placeholder="SIAKAD 241"
      />
    </div>
    <div class="space-y-1">
      <label class="text-sm font-semibold">Subjudul Aplikasi</label>
      <Input
        v-model="appSubtitle"
        placeholder="Sistem Informasi Akademik"
      />
    </div>
    <div class="space-y-1">
      <label class="text-sm font-semibold">Judul Halaman Login</label>
      <Input
        v-model="loginTitle"
        placeholder="Masuk ke SIAKAD"
      />
    </div>
    <div class="space-y-1">
      <label class="text-sm font-semibold">Deskripsi Meta (SEO)</label>
      <Textarea
        v-model="metaDescription"
        rows="2"
      />
    </div>
  </div>
</template>
