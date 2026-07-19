<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFiles } from '../composables/useFiles'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import { Button } from '@/ui/button'
import {
  Upload,
  Trash2,
  FileText,
  ImageIcon,
  Film,
  FileCode,
  RefreshCw,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const {
  files,
  isLoading,
  isUploading,
  error,
  fetchFiles,
  uploadFile,
  deleteFile,
} = useFiles()

const breadcrumbs = [
  { title: 'Dasbor', href: '/' },
  { title: 'Berkas & Dokumen', href: '/files' },
]

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

onMounted(async () => {
  await fetchFiles()
})

const handleUploadClick = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await performUpload(file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await performUpload(file)
  }
}

const performUpload = async (file: File) => {
  try {
    await uploadFile(file)
    toast.success('Berkas berhasil diunggah')
    await fetchFiles()
  } catch {
    toast.error(error.value ?? 'Gagal mengunggah berkas')
  }
}

const handleDelete = async (id: string) => {
  if (
    confirm('Apakah Anda yakin ingin menghapus berkas ini secara permanen?')
  ) {
    try {
      await deleteFile(id)
      toast.success('Berkas berhasil dihapus')
      await fetchFiles()
    } catch {
      toast.error(error.value ?? 'Gagal menghapus berkas')
    }
  }
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.startsWith('video/')) return Film
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('document')
  )
    return FileText
  return FileCode
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Berkas & Dokumen</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Unggah dan kelola dokumen unit sekolah, arsip yayasan, dan aset
            media.
          </p>
        </div>
        <Button
          variant="outline"
          :disabled="isLoading"
          @click="fetchFiles()"
        >
          <RefreshCw
            class="size-4 mr-2"
            :class="{ 'animate-spin': isLoading }"
          />
          Refresh
        </Button>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <!-- Upload Area -->
        <Card
          class="md:col-span-1 border-dashed border-2 flex flex-col justify-center items-center p-8 text-center bg-muted/20 hover:bg-muted/30 transition-all duration-300"
          :class="{ 'border-primary bg-primary/5': isDragging }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="handleUploadClick"
        >
          <CardContent
            class="p-0 flex flex-col items-center justify-center cursor-pointer"
          >
            <div class="p-4 rounded-full bg-primary/10 text-primary mb-4">
              <Upload class="size-8" />
            </div>
            <h3 class="text-base font-semibold mb-1">Unggah Berkas Baru</h3>
            <p class="text-xs text-muted-foreground max-w-[220px] mx-auto mb-4">
              Tarik & lepas berkas Anda di sini, atau klik untuk memilih berkas
              dari komputer Anda.
            </p>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              @change="handleFileChange"
            />
            <Button
              size="sm"
              :disabled="isUploading"
              @click.stop="handleUploadClick"
            >
              {{ isUploading ? 'Mengunggah...' : 'Pilih Berkas' }}
            </Button>
          </CardContent>
        </Card>

        <!-- Files List -->
        <Card
          class="md:col-span-2 overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/4"
        >
          <CardHeader class="border-b px-6 py-5">
            <CardTitle class="text-lg font-bold"
              >Semua Berkas Terunggah</CardTitle
            >
          </CardHeader>
          <CardContent class="p-6">
            <div
              v-if="isLoading && files.length === 0"
              class="text-center py-12 text-muted-foreground text-sm"
            >
              Memuat berkas...
            </div>
            <div
              v-else-if="files.length === 0"
              class="text-center py-12 text-muted-foreground text-sm"
            >
              Belum ada berkas terunggah di unit ini.
            </div>
            <div
              v-else
              class="grid gap-4 sm:grid-cols-2"
            >
              <div
                v-for="file in files"
                :key="file.id"
                class="flex items-center justify-between border p-4 rounded-xl hover:shadow-sm transition-all bg-card"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="p-2 rounded-lg bg-primary/10 text-primary shrink-0"
                  >
                    <component
                      :is="getFileIcon(file.mimeType)"
                      class="size-6"
                    />
                  </div>
                  <div class="min-w-0">
                    <span
                      class="block font-medium text-sm truncate"
                      :title="file.originalName"
                    >
                      {{ file.originalName }}
                    </span>
                    <span class="text-xs text-muted-foreground block">
                      {{ formatBytes(file.sizeBytes) }} •
                      {{ file.mimeType.split('/')[1]?.toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="handleDelete(file.id)"
                  >
                    <Trash2
                      class="size-4 text-destructive/70 hover:text-destructive"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>
