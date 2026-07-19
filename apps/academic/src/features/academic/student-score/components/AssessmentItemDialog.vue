<script setup lang="ts">
import { useStudentScore } from '../composables/useStudentScore'
import type { AssessmentType } from '@/features/academic/assessment-item'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
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
import { Trash2, Plus, Loader2 } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  changed: []
}>()

const {
  assessmentItems,
  teachingAssignment,
  saveAssessmentItem,
  deleteAssessmentItem,
} = useStudentScore()

const isSubmitting = ref(false)
const isDeleting = ref<string | null>(null)

const newItemName = ref('')
const newItemType = ref<AssessmentType>('ASSIGNMENT')
const newItemWeight = ref<number | ''>('')
const newItemMaxScore = ref<number>(100)

const assessmentTypeOptions = [
  { label: 'Tugas', value: 'ASSIGNMENT' },
  { label: 'Harian', value: 'DAILY' },
  { label: 'Praktikum', value: 'PRACTICAL' },
  { label: 'UTS', value: 'MIDTERM' },
  { label: 'UAS', value: 'FINAL' },
]

const getAssessmentTypeLabel = (type: AssessmentType) => {
  return assessmentTypeOptions.find((opt) => opt.value === type)?.label ?? type
}

const totalWeight = computed(() => {
  return assessmentItems.value.reduce(
    (sum, item) => sum + (item.weight || 0),
    0,
  )
})

const isFormValid = computed(() => {
  return (
    newItemName.value.trim().length > 0 &&
    typeof newItemWeight.value === 'number' &&
    newItemWeight.value > 0 &&
    newItemMaxScore.value > 0
  )
})

async function handleAdd() {
  if (!isFormValid.value || !teachingAssignment.value) return

  isSubmitting.value = true
  try {
    const payload = {
      teachingAssignmentId: teachingAssignment.value.id,
      name: newItemName.value,
      type: newItemType.value,
      weight: newItemWeight.value as number,
      maxScore: newItemMaxScore.value,
    }

    const result = await saveAssessmentItem(payload)
    if (result.success) {
      toast.success('Komponen penilaian berhasil ditambahkan')
      newItemName.value = ''
      newItemType.value = 'ASSIGNMENT'
      newItemWeight.value = ''
      newItemMaxScore.value = 100
      emit('changed')
    } else {
      toast.error(result.error ?? 'Gagal menambahkan komponen penilaian')
    }
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete(id: string) {
  if (
    !confirm(
      'Apakah Anda yakin ingin menghapus komponen penilaian ini? Data nilai siswa yang terkait juga mungkin akan terpengaruh.',
    )
  )
    return

  isDeleting.value = id
  try {
    const result = await deleteAssessmentItem(id)
    if (result.success) {
      toast.success('Komponen penilaian berhasil dihapus')
      emit('changed')
    } else {
      toast.error(result.error ?? 'Gagal menghapus komponen penilaian')
    }
  } finally {
    isDeleting.value = null
  }
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent class="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>Kelola Komponen Penilaian</DialogTitle>
        <DialogDescription>
          Tambahkan atau hapus komponen penilaian untuk mata pelajaran ini.
          Total bobot:
          <span
            :class="{
              'text-destructive font-bold': totalWeight > 100,
              'text-green-600 font-bold': totalWeight === 100,
            }"
          >
            {{ totalWeight }}%
          </span>
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <div class="rounded-lg border bg-muted/30 p-4">
          <h4 class="mb-3 text-sm font-medium">Tambah Komponen Baru</h4>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-12 items-end">
            <div class="sm:col-span-4 space-y-2">
              <Label>Nama Komponen</Label>
              <Input
                v-model="newItemName"
                placeholder="Contoh: Tugas 1"
              />
            </div>

            <div class="sm:col-span-3 space-y-2">
              <Label>Tipe</Label>
              <Select
                v-model="newItemType"
                as="AssessmentType"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in assessmentTypeOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="sm:col-span-2 space-y-2">
              <Label>Bobot (%)</Label>
              <Input
                v-model.number="newItemWeight"
                type="number"
                min="1"
                max="100"
                placeholder="10"
              />
            </div>

            <div class="sm:col-span-3">
              <Button
                :disabled="!isFormValid || isSubmitting"
                class="w-full"
                @click="handleAdd"
              >
                <Loader2
                  v-if="isSubmitting"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                <Plus
                  v-else
                  class="mr-2 h-4 w-4"
                />
                Tambah
              </Button>
            </div>
          </div>
        </div>

        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Komponen</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead class="text-right">Skor Maks</TableHead>
                <TableHead class="text-right">Bobot</TableHead>
                <TableHead class="w-[80px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="assessmentItems.length === 0">
                <TableCell
                  colspan="5"
                  class="h-24 text-center text-muted-foreground"
                >
                  Belum ada komponen penilaian. Tambahkan di atas.
                </TableCell>
              </TableRow>
              <TableRow
                v-for="item in assessmentItems"
                :key="item.id"
              >
                <TableCell class="font-medium">{{ item.name }}</TableCell>
                <TableCell>
                  <span
                    class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    {{ getAssessmentTypeLabel(item.type) }}
                  </span>
                </TableCell>
                <TableCell class="text-right">{{ item.maxScore }}</TableCell>
                <TableCell class="text-right">{{ item.weight }}%</TableCell>
                <TableCell class="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    :disabled="isDeleting === item.id"
                    class="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    @click="handleDelete(item.id)"
                  >
                    <Loader2
                      v-if="isDeleting === item.id"
                      class="h-4 w-4 animate-spin"
                    />
                    <Trash2
                      v-else
                      class="h-4 w-4"
                    />
                    <span class="sr-only">Hapus</span>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          @click="$emit('update:open', false)"
        >
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
