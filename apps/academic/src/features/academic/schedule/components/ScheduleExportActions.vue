<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/ui/button'
import { ImageDown, Printer } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import SchedulePrintSheet from './SchedulePrintSheet.vue'
import { drawScheduleImage } from '../logic/drawScheduleImage'
import type { ScheduleSheet } from '../logic/scheduleSheet'

const props = defineProps<{
  sheet: ScheduleSheet
  /** Nothing to print or save while the week is empty. */
  disabled?: boolean
}>()

const printSheet = ref<InstanceType<typeof SchedulePrintSheet> | null>(null)

/**
 * A filename somebody can find again.
 *
 * The heading, lowercased and hyphenated: `jadwal-mengajar-pak-ahmad.png`
 * rather than `download (3).png`.
 */
const fileName = computed(() => {
  // Both lines, because the first alone is now the same on every teacher's
  // sheet — `jadwal-mengajar.png` six times over in one folder.
  const slug = `${props.sheet.title} ${props.sheet.subtitle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'jadwal'}.png`
})

function print() {
  void printSheet.value?.print()
}

/**
 * Save the picture.
 *
 * Drawn from the same grid the printed sheet uses rather than converted out of
 * the PDF — see `drawScheduleImage`. The browser's own print dialog is what
 * makes the PDF, so there is no PDF here to convert.
 */
function saveImage() {
  const dataUrl = drawScheduleImage(props.sheet)
  if (!dataUrl) {
    toast.error('Gagal membuat gambar jadwal di peramban ini.')
    return
  }

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName.value
  link.click()

  toast.success(`Gambar jadwal disimpan sebagai ${fileName.value}`)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      :disabled="props.disabled"
      @click="print"
    >
      <Printer class="size-4" />
      Cetak
    </Button>

    <Button
      variant="outline"
      size="sm"
      :disabled="props.disabled"
      @click="saveImage"
    >
      <ImageDown class="size-4" />
      Simpan Gambar
    </Button>

    <SchedulePrintSheet
      ref="printSheet"
      :sheet="props.sheet"
    />
  </div>
</template>
