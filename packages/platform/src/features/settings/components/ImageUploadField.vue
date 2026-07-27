<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { Dialog, DialogContent, DialogTrigger } from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Image } from 'lucide-vue-next'
import { useImageUpload } from '../composables/useImageUpload'

const props = defineProps<{
  label: string
  currentUrl?: string | null
  previewTitle: string
  dialogContentClass: string
  previewWrapperClass: string
  previewImageClass: string
  upload: (file: File) => Promise<void>
  successMessage: string
  errorMessage: string
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const { file, previewUrl, isUploading, selectFile, reset, apply } =
  useImageUpload(props.upload)

const effectiveUrl = computed(() => previewUrl.value ?? props.currentUrl)

function handleChange(e: Event) {
  const selected = (e.target as HTMLInputElement).files?.[0]
  if (!selected) return
  selectFile(selected)
}

function cancelSelection() {
  reset()
  if (inputRef.value) inputRef.value.value = ''
}

async function applySelection() {
  try {
    await apply()
    toast.success(props.successMessage)
    if (inputRef.value) inputRef.value.value = ''
  } catch {
    toast.error(props.errorMessage)
  }
}

function triggerUpload() {
  inputRef.value?.click()
}
</script>

<template>
  <div class="space-y-1">
    <label class="text-sm font-semibold">{{ label }}</label>
    <div class="flex items-center gap-3 w-full">
      <Dialog v-if="effectiveUrl">
        <DialogTrigger as-child>
          <button
            type="button"
            class="h-9 w-9 rounded-md border bg-muted/30 flex items-center justify-center overflow-hidden p-1 shrink-0 hover:bg-muted/60 transition-colors cursor-zoom-in"
            title="Klik untuk memperbesar"
          >
            <img
              :src="effectiveUrl"
              :alt="label"
              class="h-full w-full object-contain"
            />
          </button>
        </DialogTrigger>
        <DialogContent :class="dialogContentClass">
          <h4 class="text-sm font-semibold self-start">{{ previewTitle }}</h4>
          <div :class="previewWrapperClass">
            <img
              :src="effectiveUrl"
              :alt="label"
              :class="previewImageClass"
            />
          </div>
        </DialogContent>
      </Dialog>
      <div class="flex items-center flex-1">
        <input
          ref="inputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleChange"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-9 w-full justify-start text-muted-foreground"
          @click="triggerUpload"
        >
          <Image class="h-4 w-4 mr-2 shrink-0" />
          Pilih Berkas
        </Button>
      </div>
    </div>
    <div
      class="text-xs text-muted-foreground pl-12 min-h-5 flex items-center mt-1"
    >
      <span
        v-if="file"
        class="bg-muted/50 px-2 py-0.5 rounded-md flex items-center max-w-full"
      >
        <span class="truncate max-w-[250px]">{{ file.name }}</span>
      </span>
      <span v-else> Tidak ada berkas terpilih </span>
    </div>
    <div
      v-if="file"
      class="flex items-center justify-end gap-2 mt-2"
    >
      <Button
        size="sm"
        variant="outline"
        :disabled="isUploading"
        @click="cancelSelection"
      >
        Batal
      </Button>
      <Button
        size="sm"
        variant="default"
        :disabled="isUploading"
        @click="applySelection"
      >
        {{ isUploading ? 'Menerapkan...' : 'Terapkan' }}
      </Button>
    </div>
  </div>
</template>
