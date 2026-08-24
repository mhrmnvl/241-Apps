<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Loader2, Trash2 } from 'lucide-vue-next'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'

const props = defineProps<{ canEdit: boolean }>()

const { rows, types, loading, hasChanges, load, addRow, saveAll, deleteRow } =
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

defineExpose({
  addRow,
  saveAll,
  hasChanges,
  loading,
})
</script>

<template>
  <div class="border rounded-md bg-background overflow-hidden">
    <div class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50 hover:bg-muted/50">
            <TableHead class="text-center font-medium w-20"> Urutan </TableHead>
            <TableHead class="text-center font-medium min-w-[160px]">
              Nama Jam
            </TableHead>
            <TableHead class="text-center font-medium w-32"> Mulai </TableHead>
            <TableHead class="text-center font-medium w-32">
              Selesai
            </TableHead>
            <TableHead class="text-center font-medium min-w-[150px]">
              Tipe
            </TableHead>
            <TableHead
              v-if="props.canEdit"
              class="text-center font-medium w-20"
            >
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell
              :colspan="props.canEdit ? 6 : 5"
              class="h-32 text-center text-muted-foreground"
            >
              <Loader2 class="size-6 mx-auto animate-spin" />
            </TableCell>
          </TableRow>

          <TableRow v-else-if="rows.length === 0">
            <TableCell
              :colspan="props.canEdit ? 6 : 5"
              class="h-32 text-center text-sm text-muted-foreground italic"
            >
              Belum ada jam pelajaran. Klik "Tambah Baris" untuk membuat.
            </TableCell>
          </TableRow>

          <TableRow
            v-for="(row, index) in rows"
            v-else
            :key="row.id ?? `draft-${index}`"
          >
            <TableCell class="text-center align-middle py-2 px-3">
              <Input
                v-model.number="row.order"
                type="number"
                min="1"
                class="w-16 text-center mx-auto h-9"
                :disabled="!props.canEdit || row.saving"
              />
            </TableCell>
            <TableCell class="align-middle py-2 px-3">
              <Input
                v-model="row.name"
                placeholder="cth: Jam ke-1"
                class="text-center h-9"
                :disabled="!props.canEdit || row.saving"
              />
            </TableCell>
            <TableCell class="align-middle py-2 px-3">
              <Input
                v-model="row.startTime"
                type="time"
                class="h-9 text-center"
                :disabled="!props.canEdit || row.saving"
              />
            </TableCell>
            <TableCell class="align-middle py-2 px-3">
              <Input
                v-model="row.endTime"
                type="time"
                class="h-9 text-center"
                :disabled="!props.canEdit || row.saving"
              />
            </TableCell>
            <TableCell class="align-middle py-2 px-3">
              <Select
                v-model="row.typeId"
                :disabled="!props.canEdit || row.saving"
              >
                <SelectTrigger class="w-full justify-center h-9">
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
            </TableCell>
            <TableCell
              v-if="props.canEdit"
              class="text-center align-middle py-2 px-3"
            >
              <div class="flex items-center justify-center">
                <Button
                  size="icon"
                  variant="ghost"
                  class="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  :disabled="row.saving"
                  @click="requestDelete(row, index)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
        <AlertDialogCancel @click="pendingDeleteIndex = null">
          Batal
        </AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="confirmDelete"
        >
          Hapus
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
