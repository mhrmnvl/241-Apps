<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { ScrollArea } from '@/ui/scroll-area'
import { Button } from '@/ui/button'
import { Label } from '@/ui/label'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { useRapor } from '../composables/useRapor'
import type { RaporData } from '../types'

const props = defineProps<{
  open: boolean
  rapor: RaporData | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { updateRapor, isSaving } = useRapor()

const teacherNote = ref('')
const rank = ref<number | ''>('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.rapor) {
      teacherNote.value = props.rapor.teacherNote ?? ''
      rank.value = props.rapor.rank ?? ''
    }
  },
)

const handleSave = async () => {
  if (!props.rapor) return

  const res = await updateRapor(props.rapor.id, {
    teacherNote: teacherNote.value || undefined,
    rank: rank.value !== '' ? Number(rank.value) : undefined,
  })

  if (res.success) {
    emit('update:open', false)
  }
}
</script>

<template>
  <Sheet
    :open="open"
    @update:open="
      (val) => {
        if (!isSaving) emit('update:open', val)
      }
    "
  >
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>Edit Rapor</SheetTitle>
        <SheetDescription>
          Perbarui catatan wali kelas dan peringkat untuk
          <span class="font-semibold text-primary">{{
            rapor?.enrollment?.student?.user?.profile?.name || 'Siswa'
          }}</span>
          .
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <div class="px-6 py-4 space-y-4">
          <div
            v-if="rapor"
            class="rounded-lg border bg-muted/30 p-3 text-sm space-y-1"
          >
            <div class="flex justify-between">
              <span class="text-muted-foreground">Kelas</span>
              <span class="font-medium">{{
                rapor.enrollment?.classroom?.displayName || '-'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Rata-rata</span>
              <span class="font-medium">{{
                rapor.totalAverage !== null
                  ? Number(rapor.totalAverage).toFixed(2)
                  : '-'
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Peringkat</span>
              <span class="font-medium">{{ rapor.rank ?? '-' }}</span>
            </div>
          </div>

          <form
            id="rapor-form"
            class="grid gap-4 py-2"
            @submit.prevent="handleSave"
          >
            <div class="space-y-2">
              <Label for="rank">Peringkat (Opsional)</Label>
              <Input
                id="rank"
                v-model="rank"
                type="number"
                min="1"
                placeholder="Masukkan peringkat siswa"
              />
            </div>
            <div class="space-y-2">
              <Label for="teacherNote">Catatan Wali Kelas (Opsional)</Label>
              <Textarea
                id="teacherNote"
                v-model="teacherNote"
                placeholder="Masukkan catatan pengembangan atau pesan untuk siswa..."
                class="min-h-[120px] resize-none"
              />
            </div>
          </form>
        </div>
      </ScrollArea>

      <SheetFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          variant="outline"
          :disabled="isSaving"
          @click="emit('update:open', false)"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="rapor-form"
          :disabled="isSaving"
        >
          <span
            v-if="isSaving"
            class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
          ></span>
          Simpan
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
