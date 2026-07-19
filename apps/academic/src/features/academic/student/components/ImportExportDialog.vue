<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import {
  Download,
  FileSpreadsheet,
  FileType,
  Inbox,
  Info,
  UploadCloud,
  XCircle,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  isProcessing: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  downloadTemplate: []
  exportData: []
  importData: [file: File]
}>()

const open = computed({
  get: () => props.open,
  set: (val: boolean) => !props.isProcessing && emit('update:open', val),
})

const activeTab = ref('import')
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (!props.isProcessing) isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (props.isProcessing) return

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files.item(0)
    if (file) handleFileSelect(file)
  }
}

function triggerFileInput() {
  if (!props.isProcessing) fileInput.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files.item(0)
    if (file) handleFileSelect(file)
  }
}

function handleFileSelect(file: File) {
  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.name.endsWith('.xlsx')
  ) {
    selectedFile.value = file
  } else {
    alert(
      'Maaf, format file tidak didukung. Harap unggah file dalam format Excel (.xlsx) agar sistem dapat memprosesnya.',
    )
  }
}

function clearFile() {
  if (!props.isProcessing) {
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
  }
}

function handleImport() {
  if (selectedFile.value) {
    emit('importData', selectedFile.value)
  }
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function handleDialogClose() {
  if (!props.isProcessing) {
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedFile.value = null
      if (fileInput.value) fileInput.value.value = ''
    }
  },
)
</script>

<template>
  <Dialog
    v-model:open="open"
    @update:open="handleDialogClose"
  >
    <DialogContent class="sm:max-w-[450px] p-0 overflow-hidden">
      <DialogHeader class="px-6 pt-6 pb-4 bg-muted/20 border-b">
        <DialogTitle class="flex items-center gap-2">
          <FileSpreadsheet class="size-5 text-emerald-600" />
          Manajemen Data Excel
        </DialogTitle>
        <DialogDescription class="sr-only">
          Dialog untuk mengelola data siswa melalui impor dan ekspor file Excel.
        </DialogDescription>
      </DialogHeader>

      <Tabs
        v-model="activeTab"
        class="w-full px-6 pb-4"
      >
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="import"> Import Siswa </TabsTrigger>
          <TabsTrigger value="export"> Export Data </TabsTrigger>
        </TabsList>

        <div class="py-4">
          <TabsContent
            value="import"
            class="mt-0 space-y-4"
          >
            <div
              v-if="!isProcessing && !selectedFile"
              class="border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-muted/50"
              :class="
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25'
              "
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
              @click="triggerFileInput"
            >
              <div
                class="p-3 bg-primary/10 rounded-full text-primary ring-4 ring-primary/5"
              >
                <UploadCloud class="size-6" />
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">
                  Klik atau tarik file ke sini
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Hanya mendukung format .xlsx
                </p>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept=".xlsx"
                class="hidden"
                aria-label="Pilih file spreadsheet Excel"
                @change="onFileChange"
              />
            </div>

            <div
              v-else-if="!isProcessing && selectedFile"
              class="bg-muted/30 border rounded-xl p-4 flex items-center justify-between"
            >
              <div class="flex items-center gap-3 overflow-hidden">
                <div
                  class="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0"
                >
                  <FileType class="size-5" />
                </div>
                <div class="min-w-0 pr-4">
                  <p class="text-sm font-medium truncate text-foreground">
                    {{ selectedFile.name }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatSize(selectedFile.size) }}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="shrink-0 text-muted-foreground hover:text-destructive"
                @click="clearFile"
              >
                <XCircle class="size-4" />
              </Button>
            </div>

            <div
              v-else
              class="space-y-4 bg-muted/10 p-5 rounded-xl border"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium">Memproses Data</span>
              </div>
              <p class="text-xs text-center text-muted-foreground">
                Mohon tunggu sementara data sedang diproses di server...
              </p>
            </div>

            <Alert
              variant="default"
              class="bg-blue-50/30 border-blue-100 text-blue-900 text-xs"
            >
              <Info class="size-4" />
              <AlertTitle>Penting</AlertTitle>
              <AlertDescription>
                Pastikan kolom sesuai dengan format sistem. Unduh template jika
                belum memilikinya.
              </AlertDescription>
            </Alert>

            <div class="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                class="text-xs h-9"
                :disabled="isProcessing"
                @click="$emit('downloadTemplate')"
              >
                <Download class="size-3.5 mr-2" />
                Unduh Template
              </Button>

              <Button
                class="h-9"
                :disabled="!selectedFile || isProcessing"
                @click="handleImport"
              >
                {{ isProcessing ? 'Memproses...' : 'Mulai Import' }}
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="export"
            class="mt-0 space-y-4"
          >
            <div
              class="bg-muted/30 border rounded-xl p-6 text-center space-y-3"
            >
              <div
                class="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 ring-4 ring-emerald-50"
              >
                <Inbox class="size-6" />
              </div>
              <h3 class="font-medium">Export Detail Siswa</h3>
              <p
                class="text-xs text-muted-foreground leading-relaxed max-w-[300px] mx-auto"
              >
                Semua data siswa yang muncul di tabel saat ini (berdasarkan
                filter tingkat & kelas) akan diekspor ke dalam format Excel.
              </p>
            </div>

            <Button
              class="w-full mt-2"
              @click="$emit('exportData')"
            >
              <Download class="size-4 mr-2" />
              Export Semua Data ke .xlsx
            </Button>
          </TabsContent>
        </div>
      </Tabs>
    </DialogContent>
  </Dialog>
</template>
