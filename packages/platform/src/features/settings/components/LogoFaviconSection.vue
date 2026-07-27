<script setup lang="ts">
import { Separator } from '@/ui/separator'
import ImageUploadField from './ImageUploadField.vue'

defineProps<{
  logoUrl?: string | null
  faviconUrl?: string | null
  uploadLogo: (file: File) => Promise<void>
  uploadFavicon: (file: File) => Promise<void>
}>()
</script>

<template>
  <div
    class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4"
  >
    <h3 class="text-lg font-bold text-foreground">Logo & Favicon</h3>
    <Separator />
    <div class="space-y-3">
      <ImageUploadField
        label="Logo Aplikasi"
        :current-url="logoUrl"
        preview-title="Pratinjau Logo"
        dialog-content-class="max-w-md p-6 flex flex-col items-center justify-center gap-4"
        preview-wrapper-class="rounded-xl border bg-muted/10 p-6 flex items-center justify-center max-h-[300px] w-full overflow-hidden"
        preview-image-class="max-h-[250px] w-auto object-contain"
        :upload="uploadLogo"
        success-message="Logo berhasil diperbarui"
        error-message="Gagal mengunggah logo"
      />
      <ImageUploadField
        label="Favicon"
        :current-url="faviconUrl"
        preview-title="Pratinjau Favicon"
        dialog-content-class="max-w-xs p-6 flex flex-col items-center justify-center gap-4"
        preview-wrapper-class="rounded-xl border bg-muted/10 p-6 flex items-center justify-center h-40 w-40 overflow-hidden"
        preview-image-class="h-24 w-24 object-contain"
        :upload="uploadFavicon"
        success-message="Favicon berhasil diperbarui"
        error-message="Gagal mengunggah favicon"
      />
    </div>
  </div>
</template>
