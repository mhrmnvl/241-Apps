import { ref } from 'vue'

export function useImageUpload(upload: (file: File) => Promise<void>) {
  const file = ref<File | null>(null)
  const previewUrl = ref<string | null>(null)
  const isUploading = ref(false)

  function selectFile(selected: File) {
    file.value = selected
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = URL.createObjectURL(selected)
  }

  function reset() {
    file.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  }

  async function apply() {
    if (!file.value) return
    isUploading.value = true
    try {
      await upload(file.value)
      reset()
    } finally {
      isUploading.value = false
    }
  }

  return { file, previewUrl, isUploading, selectFile, reset, apply }
}
