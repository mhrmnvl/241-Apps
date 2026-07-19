<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AvailableStudent } from '../types'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Skeleton } from '@/ui/skeleton'
import { formatEntityName } from '@/shared/utils/utils'

const props = defineProps<{
  open: boolean
  className: string
  students: AvailableStudent[]
  loading: boolean
  enrolling: boolean
  remainingCapacity: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  enroll: [studentIds: string[]]
}>()

const dialogOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const selectedIds = ref<Record<string, boolean>>({})
const searchQuery = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      selectedIds.value = {}
      searchQuery.value = ''
    }
  },
)

const filteredStudents = computed(() => {
  if (!searchQuery.value) return props.students
  const q = searchQuery.value.toLowerCase()
  return props.students.filter(
    (s) =>
      s.user.profile.name.toLowerCase().includes(q) ||
      s.nis.includes(q) ||
      s.nisn.includes(q),
  )
})

const selectedCount = computed(
  () => Object.values(selectedIds.value).filter(Boolean).length,
)

const allChecked = computed(
  () =>
    filteredStudents.value.length > 0 &&
    filteredStudents.value.every((s) => selectedIds.value[s.id]),
)

const someChecked = computed(
  () =>
    filteredStudents.value.some((s) => selectedIds.value[s.id]) &&
    !allChecked.value,
)

function toggleStudent(id: string, checked: boolean | 'indeterminate') {
  if (!!checked && selectedCount.value >= props.remainingCapacity) return
  selectedIds.value = { ...selectedIds.value, [id]: !!checked }
}

function toggleAll(checked: boolean | 'indeterminate') {
  const next = { ...selectedIds.value }
  let count = 0
  for (const s of filteredStudents.value) {
    if (!!checked && count >= props.remainingCapacity) break
    next[s.id] = !!checked
    if (checked) count++
  }
  selectedIds.value = next
}

function handleEnroll() {
  const ids = Object.entries(selectedIds.value)
    .filter(([, v]) => v)
    .map(([k]) => k)
  if (ids.length === 0) return
  emit('enroll', ids)
}
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="sm:max-w-4xl max-h-[85vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Tambah Siswa ke {{ className }}</DialogTitle>
        <DialogDescription>
          Pilih siswa yang akan didaftarkan ke kelas ini.
        </DialogDescription>
      </DialogHeader>

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2"
      >
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p class="text-sm text-muted-foreground shrink-0">
            {{ filteredStudents.length }} siswa tersedia
          </p>
          <p
            v-if="remainingCapacity <= 0"
            class="text-sm text-destructive font-medium"
          >
            Kelas sudah penuh
          </p>
          <p
            v-else
            class="text-sm text-muted-foreground"
          >
            Sisa kapasitas: {{ remainingCapacity - selectedCount }}
          </p>
        </div>
        <Input
          v-model="searchQuery"
          placeholder="Cari nama / NIS / NISN..."
          class="h-8 w-full sm:max-w-xs text-sm"
        />
      </div>

      <div class="flex-1 overflow-y-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow class="bg-muted/50 hover:bg-muted/50">
              <TableHead class="w-[50px] text-center px-4">
                <input
                  type="checkbox"
                  class="size-4 rounded accent-primary cursor-pointer"
                  :checked="allChecked"
                  :indeterminate="someChecked"
                  aria-label="Pilih semua"
                  @change="
                    toggleAll(($event.target as HTMLInputElement).checked)
                  "
                />
              </TableHead>
              <TableHead class="w-[50px] text-center px-4"> No </TableHead>
              <TableHead class="px-4">NIS</TableHead>
              <TableHead class="px-4">NISN</TableHead>
              <TableHead class="px-4">Nama Siswa</TableHead>
              <TableHead class="px-4">L/P</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading">
              <TableRow
                v-for="i in 5"
                :key="i"
              >
                <TableCell
                  v-for="j in 6"
                  :key="j"
                  class="px-4 py-2.5"
                >
                  <Skeleton class="h-5 w-full" />
                </TableCell>
              </TableRow>
            </template>
            <template v-else-if="filteredStudents.length > 0">
              <TableRow
                v-for="(student, idx) in filteredStudents"
                :key="student.id"
                class="cursor-pointer"
                :class="{ 'bg-primary/5': selectedIds[student.id] }"
              >
                <TableCell class="w-[50px] text-center px-4">
                  <input
                    type="checkbox"
                    class="size-4 rounded accent-primary cursor-pointer"
                    :checked="!!selectedIds[student.id]"
                    aria-label="Pilih baris"
                    @change="
                      toggleStudent(
                        student.id,
                        ($event.target as HTMLInputElement).checked,
                      )
                    "
                  />
                </TableCell>
                <TableCell class="w-[50px] text-center px-4">
                  {{ idx + 1 }}
                </TableCell>
                <TableCell class="px-4">{{ student.nis }}</TableCell>
                <TableCell class="px-4">{{ student.nisn }}</TableCell>
                <TableCell class="px-4">
                  {{ formatEntityName(student.user.profile.name) }}
                </TableCell>
                <TableCell class="px-4">
                  {{
                    student.user.profile.gender === 'MALE'
                      ? 'L'
                      : student.user.profile.gender === 'FEMALE'
                        ? 'P'
                        : '-'
                  }}
                </TableCell>
              </TableRow>
            </template>
            <template v-else>
              <TableRow>
                <TableCell
                  :colspan="6"
                  class="h-24 text-center"
                >
                  Tidak ada siswa ditemukan.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <DialogFooter class="pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          :disabled="enrolling"
          @click="dialogOpen = false"
        >
          Batal
        </Button>
        <Button
          type="button"
          :disabled="selectedCount === 0 || enrolling"
          @click="handleEnroll"
        >
          {{
            enrolling
              ? 'Mendaftarkan...'
              : selectedCount > 0
                ? `Daftarkan ${selectedCount} Siswa`
                : 'Pilih siswa dulu'
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
