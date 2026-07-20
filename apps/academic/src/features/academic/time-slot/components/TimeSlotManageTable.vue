<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Clock, Loader2, Plus, Save, Trash2 } from 'lucide-vue-next'
import { useTimeSlotManager } from '../composables/useTimeSlotManager'
import type { EditableTimeSlotRow } from '../composables/useTimeSlotManager'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'

const props = defineProps<{ canEdit: boolean }>()

const { rows, types, loading, load, addRow, saveRow, deleteRow, isDirty } =
  useTimeSlotManager()

const pendingDeleteIndex = ref<number | null>(null)

onMounted(load)

async function confirmDelete() {
  const index = pendingDeleteIndex.value
  pendingDeleteIndex.value = null
  if (index === null) return
  const row = rows.value[index]
  if (row) await deleteRow(row, index)
}

function requestDelete(row: EditableTimeSlotRow, index: number) {
  if (row.id === null) {
    void deleteRow(row, index)
    return
  }
  pendingDeleteIndex.value = index
}
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border bg-card shadow-sm shadow-black/5 ring-1 ring-black/4"
  >
    <div class="flex items-center justify-between gap-2 border-b px-6 py-4">
      <div class="flex items-center gap-2">
        <Clock class="size-4 text-primary shrink-0" />
        <span class="font-semibold text-sm">Kelola Jam Pelajaran</span>
      </div>
      <Button
        v-if="props.canEdit"
        size="sm"
        variant="outline"
        :disabled="loading"
        @click="addRow"
      >
        <Plus class="size-4 mr-1.5" />
        Tambah Baris
      </Button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-muted/40 text-muted-foreground">
            <th class="border-b px-4 py-3 text-center font-semibold w-20">
              Urutan
            </th>
            <th
              class="border-b px-4 py-3 text-left font-semibold min-w-[160px]"
            >
              Nama Jam
            </th>
            <th class="border-b px-4 py-3 text-center font-semibold w-32">
              Mulai
            </th>
            <th class="border-b px-4 py-3 text-center font-semibold w-32">
              Selesai
            </th>
            <th
              class="border-b px-4 py-3 text-left font-semibold min-w-[150px]"
            >
              Tipe
            </th>
            <th
              v-if="props.canEdit"
              class="border-b px-4 py-3 text-center font-semibold w-28"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td
              :colspan="props.canEdit ? 6 : 5"
              class="px-4 py-10 text-center text-muted-foreground"
            >
              <Loader2 class="size-5 mx-auto animate-spin" />
            </td>
          </tr>

          <tr v-else-if="rows.length === 0">
            <td
              :colspan="props.canEdit ? 6 : 5"
              class="px-4 py-10 text-center text-sm text-muted-foreground italic"
            >
              Belum ada jam pelajaran. Klik "Tambah Baris" untuk membuat.
            </td>
          </tr>

          <tr
            v-for="(row, index) in rows"
            v-else
            :key="row.id ?? `draft-${index}`"
            class="hover:bg-muted/10 transition-colors"
            :class="row.id === null ? 'bg-primary/5' : ''"
          >
            <td class="border-b px-3 py-2 text-center align-middle">
              <Input
                v-model.number="row.order"
                type="number"
                min="1"
                class="w-16 text-center mx-auto"
                :disabled="!props.canEdit || row.saving"
              />
            </td>
            <td class="border-b px-3 py-2 align-middle">
              <Input
                v-model="row.name"
                placeholder="cth: Jam ke-1"
                :disabled="!props.canEdit || row.saving"
              />
            </td>
            <td class="border-b px-3 py-2 align-middle">
              <Input
                v-model="row.startTime"
                type="time"
                :disabled="!props.canEdit || row.saving"
              />
            </td>
            <td class="border-b px-3 py-2 align-middle">
              <Input
                v-model="row.endTime"
                type="time"
                :disabled="!props.canEdit || row.saving"
              />
            </td>
            <td class="border-b px-3 py-2 align-middle">
              <Select
                v-model="row.typeId"
                :disabled="!props.canEdit || row.saving"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih tipe..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="type in types"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </td>
            <td
              v-if="props.canEdit"
              class="border-b px-3 py-2 text-center align-middle"
            >
              <div class="flex items-center justify-center gap-1">
                <Button
                  size="sm"
                  variant="default"
                  :disabled="row.saving || !isDirty(row)"
                  @click="saveRow(row)"
                >
                  <Loader2
                    v-if="row.saving"
                    class="size-4 animate-spin"
                  />
                  <Save
                    v-else
                    class="size-4"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  class="text-destructive hover:text-destructive"
                  :disabled="row.saving"
                  @click="requestDelete(row, index)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <AlertDialog
    :open="pendingDeleteIndex !== null"
    @update:open="(value) => !value && (pendingDeleteIndex = null)"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus Jam Pelajaran?</AlertDialogTitle>
        <AlertDialogDescription>
          Data jam pelajaran yang dihapus tidak dapat dikembalikan.
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
