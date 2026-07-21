<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Loader2, Save, Trash2 } from 'lucide-vue-next'
import {
  useTimeSlotTypeManager,
  WEEK_DAYS,
} from '../composables/useTimeSlotTypeManager'
import type { EditableTimeSlotTypeRow } from '../composables/useTimeSlotTypeManager'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'

const props = defineProps<{ canEdit: boolean }>()

const {
  rows,
  loading,
  hasChanges,
  load,
  addRow,
  toggleDay,
  deleteRow,
  saveAll,
} = useTimeSlotTypeManager()

const pendingDeleteIndex = ref<number | null>(null)

onMounted(load)

async function confirmDelete() {
  const index = pendingDeleteIndex.value
  pendingDeleteIndex.value = null
  if (index === null) return
  const row = rows.value[index]
  if (row) await deleteRow(row, index)
}

function requestDelete(row: EditableTimeSlotTypeRow, index: number) {
  if (row.id === null) {
    void deleteRow(row, index)
    return
  }
  pendingDeleteIndex.value = index
}

defineExpose({ addRow, saveAll, hasChanges })
</script>

<template>
  <div class="rounded-md border overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-muted/40 text-muted-foreground">
            <th class="border-b px-4 py-3 text-left font-semibold w-40">
              Kode
            </th>
            <th
              class="border-b px-4 py-3 text-left font-semibold min-w-[160px]"
            >
              Nama
            </th>
            <th class="border-b px-4 py-3 text-left font-semibold w-40">
              Jenis
            </th>
            <th
              class="border-b px-4 py-3 text-left font-semibold min-w-[260px]"
            >
              Hari Berlaku
            </th>
            <th
              v-if="props.canEdit"
              class="border-b px-4 py-3 text-center font-semibold w-20"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td
              :colspan="props.canEdit ? 5 : 4"
              class="px-4 py-10 text-center text-muted-foreground"
            >
              <Loader2 class="size-5 mx-auto animate-spin" />
            </td>
          </tr>

          <tr v-else-if="rows.length === 0">
            <td
              :colspan="props.canEdit ? 5 : 4"
              class="px-4 py-10 text-center text-sm text-muted-foreground italic"
            >
              Belum ada tipe jam. Klik "Tambah Tipe" untuk membuat.
            </td>
          </tr>

          <tr
            v-for="(row, index) in rows"
            v-else
            :key="row.id ?? `draft-${index}`"
            class="hover:bg-muted/10 transition-colors align-top"
            :class="row.id === null ? 'bg-primary/5' : ''"
          >
            <td class="border-b px-3 py-2">
              <Input
                v-model="row.code"
                placeholder="cth: CEREMONY"
                :disabled="!props.canEdit || row.saving"
              />
            </td>
            <td class="border-b px-3 py-2">
              <Input
                v-model="row.name"
                placeholder="cth: Upacara"
                :disabled="!props.canEdit || row.saving"
              />
            </td>
            <td class="border-b px-3 py-2">
              <div class="flex items-center gap-2 pt-1.5">
                <Switch
                  :model-value="row.isLesson"
                  :disabled="!props.canEdit || row.saving"
                  @update:model-value="(v) => (row.isLesson = v)"
                />
                <span class="text-xs text-muted-foreground">
                  {{ row.isLesson ? 'Pelajaran' : 'Khusus' }}
                </span>
              </div>
            </td>
            <td class="border-b px-3 py-2">
              <div class="flex flex-wrap gap-1">
                <Button
                  v-for="d in WEEK_DAYS"
                  :key="d.value"
                  type="button"
                  size="sm"
                  class="h-7 px-2"
                  :variant="row.days.includes(d.value) ? 'default' : 'outline'"
                  :disabled="!props.canEdit || row.saving"
                  @click="toggleDay(row, d.value)"
                >
                  {{ d.label }}
                </Button>
              </div>
              <p class="text-[11px] text-muted-foreground mt-1">
                {{
                  row.days.length === 0
                    ? 'Kosong = berlaku semua hari'
                    : `Hanya: ${row.days.length} hari`
                }}
              </p>
            </td>
            <td
              v-if="props.canEdit"
              class="border-b px-3 py-2 text-center"
            >
              <Button
                size="icon"
                variant="ghost"
                class="text-destructive hover:text-destructive h-8 w-8"
                :disabled="row.saving"
                @click="requestDelete(row, index)"
              >
                <Trash2 class="size-4" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="props.canEdit"
      class="flex justify-end border-t px-6 py-4 bg-muted/10"
    >
      <Button
        :disabled="!hasChanges || loading"
        @click="saveAll"
      >
        <Loader2
          v-if="loading"
          class="size-4 mr-2 animate-spin"
        />
        <Save
          v-else
          class="size-4 mr-2"
        />
        Simpan
      </Button>
    </div>
  </div>

  <AlertDialog
    :open="pendingDeleteIndex !== null"
    @update:open="(value) => !value && (pendingDeleteIndex = null)"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus Tipe Jam?</AlertDialogTitle>
        <AlertDialogDescription>
          Tipe yang masih dipakai oleh jam pelajaran tidak dapat dihapus.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button
          variant="outline"
          @click="pendingDeleteIndex = null"
        >
          Batal
        </Button>
        <Button
          variant="destructive"
          @click="confirmDelete"
        >
          Hapus
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
