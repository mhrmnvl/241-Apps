<script setup lang="ts">
import type { Component } from 'vue'
import { Button } from '@/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/ui/avatar'
import { Camera } from 'lucide-vue-next'

const props = defineProps<{
  fullName: string
  subtitle: string
  initials: string
  avatarUrl?: string | null
  isEditable: boolean
  isOwnProfile: boolean
  isUploadingPhoto: boolean
  activeTab: string
  actionConfig: { text: string; icon: Component }
}>()

const emit = defineEmits<{
  actionClick: [tabId: string]
  photoChange: [file: File]
}>()

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('photoChange', file)
  ;(e.target as HTMLInputElement).value = ''
}

function triggerPhotoUpload() {
  if (props.isUploadingPhoto) return
  document.getElementById('profile-photo-input')?.click()
}
</script>

<template>
  <div class="px-6 pt-6 pb-2">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border bg-background shadow-sm"
    >
      <div class="flex items-center gap-4">
        <div class="relative shrink-0">
          <Avatar class="size-16 border-2 border-primary/20">
            <AvatarImage
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="fullName"
            />
            <AvatarFallback
              class="bg-primary/10 text-xl font-bold text-primary"
            >
              {{ initials }}
            </AvatarFallback>
          </Avatar>

          <template v-if="isOwnProfile">
            <input
              id="profile-photo-input"
              type="file"
              accept="image/*"
              class="hidden"
              :disabled="isUploadingPhoto"
              @change="handleFileChange"
            />
            <button
              type="button"
              title="Ganti foto profil"
              class="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              :disabled="isUploadingPhoto"
              @click="triggerPhotoUpload"
            >
              <Camera class="size-3" />
            </button>
          </template>
        </div>

        <div>
          <h2 class="text-xl font-bold text-foreground">
            {{ fullName || '-' }}
          </h2>
          <p class="text-sm font-medium text-muted-foreground mt-0.5">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <Button
        v-if="isEditable"
        variant="outline"
        class="sm:shrink-0 w-full sm:w-auto"
        @click="emit('actionClick', activeTab)"
      >
        <component
          :is="actionConfig.icon"
          class="size-4 mr-2"
        />
        {{ actionConfig.text }}
      </Button>
    </div>
  </div>
</template>
