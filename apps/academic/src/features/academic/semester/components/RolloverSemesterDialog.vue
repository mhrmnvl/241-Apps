<script setup lang="ts">
import type {
  RolloverSemesterPayload,
  RolloverSummary,
  RolloverSummaryRow,
  Semester,
} from '../types'
import { Alert, AlertDescription } from '@/ui/alert'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Copy,
  Loader2,
} from 'lucide-vue-next'
import { computed, reactive, watch } from 'vue'

const props = defineProps<{
  open: boolean
  semesters: Semester[]
  isRollingOver: boolean
  rolloverSummary: RolloverSummary | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  rollover: [payload: RolloverSemesterPayload]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const formData = reactive({
  sourceSemesterId: '',
  targetSemesterId: '',
})

function getSemesterLabel(semester: Semester) {
  const ayName = semester.academicYear?.name ?? 'N/A'
  return `${semester.type?.name === 'ODD' ? 'Ganjil' : 'Genap'} — ${ayName}`
}

const sourceSemester = computed(() =>
  props.semesters.find((s) => s.id === formData.sourceSemesterId),
)

const targetSemester = computed(() =>
  props.semesters.find((s) => s.id === formData.targetSemesterId),
)

const totalCreated = computed(() => {
  if (!props.rolloverSummary) return 0
  const s = props.rolloverSummary
  return (
    s.classes.created +
    s.enrollments.created +
    s.supervisors.created +
    s.teachingAssignments.created +
    s.schedules.created
  )
})

const totalSkipped = computed(() => {
  if (!props.rolloverSummary) return 0
  const s = props.rolloverSummary
  return (
    s.classes.skipped +
    s.enrollments.skipped +
    s.supervisors.skipped +
    s.teachingAssignments.skipped +
    s.schedules.skipped
  )
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      formData.sourceSemesterId = ''
      formData.targetSemesterId = ''

      const activeSemester = props.semesters.find((s) => s.isActive)
      if (activeSemester) {
        formData.sourceSemesterId = activeSemester.id
      }

      const firstInactive = props.semesters.find((s) => !s.isActive)
      if (firstInactive) {
        formData.targetSemesterId = firstInactive.id
      }
    }
  },
)

function handleConfirmRollover() {
  emit('rollover', { ...formData })
}

const summaryRows = computed((): RolloverSummaryRow[] => {
  if (!props.rolloverSummary) return []
  const s = props.rolloverSummary
  return [
    { label: 'Kelas', created: s.classes.created, skipped: s.classes.skipped },
    {
      label: 'Enrollment Siswa',
      created: s.enrollments.created,
      skipped: s.enrollments.skipped,
    },
    {
      label: 'Wali Kelas',
      created: s.supervisors.created,
      skipped: s.supervisors.skipped,
    },
    {
      label: 'Penugasan Guru',
      created: s.teachingAssignments.created,
      skipped: s.teachingAssignments.skipped,
    },
    {
      label: 'Jadwal',
      created: s.schedules.created,
      skipped: s.schedules.skipped,
    },
  ]
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <CalendarRange class="size-5 text-muted-foreground" />
          Salin Data Semester
        </DialogTitle>
      </DialogHeader>

      <div
        v-if="rolloverSummary"
        class="space-y-4 py-4"
      >
        <Alert
          variant="default"
          class="border-emerald-200 bg-emerald-50 text-emerald-800"
        >
          <CheckCircle2 class="size-4 text-emerald-600" />
          <AlertDescription class="font-medium">
            Penyalinan berhasil! {{ totalCreated }} data disalin,
            {{ totalSkipped }} data dilewati.
          </AlertDescription>
        </Alert>

        <div class="rounded-lg border overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted/50">
                <th
                  class="px-4 py-2.5 text-left font-medium text-muted-foreground"
                >
                  Entitas Data
                </th>
                <th
                  class="px-4 py-2.5 text-center font-medium text-muted-foreground"
                >
                  Disalin
                </th>
                <th
                  class="px-4 py-2.5 text-center font-medium text-muted-foreground"
                >
                  Dilewati
                </th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr
                v-for="row in summaryRows"
                :key="row.label"
                class="bg-background transition-colors hover:bg-muted/50"
              >
                <td class="px-4 py-3 font-medium">{{ row.label }}</td>
                <td class="px-4 py-3 text-center">
                  <Badge
                    v-if="row.created > 0"
                    variant="default"
                    class="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                  >
                    +{{ row.created }}
                  </Badge>
                  <span
                    v-else
                    class="text-muted-foreground font-medium"
                    >0</span
                  >
                </td>
                <td class="px-4 py-3 text-center">
                  <Badge
                    v-if="row.skipped > 0"
                    variant="secondary"
                    class="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
                  >
                    {{ row.skipped }}
                  </Badge>
                  <span
                    v-else
                    class="text-muted-foreground font-medium"
                    >0</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button @click="open = false">Selesai</Button>
        </DialogFooter>
      </div>

      <div
        v-else
        class="space-y-4 py-4"
      >
        <div class="rounded-lg bg-muted/30 border py-4 px-5">
          <div class="flex items-center justify-between gap-3 mb-3">
            <span
              class="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex-1 text-center"
              >Dari</span
            >
            <div class="shrink-0 w-8" />
            <span
              class="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex-1 text-center"
              >Ke</span
            >
          </div>
          <div class="flex items-center justify-between gap-3">
            <Badge
              variant="outline"
              class="px-3 py-1.5 text-sm bg-background flex-1 justify-center"
            >
              {{
                sourceSemester
                  ? getSemesterLabel(sourceSemester)
                  : 'Pilih sumber'
              }}
            </Badge>
            <div
              class="flex items-center justify-center shrink-0 text-muted-foreground bg-muted p-1.5 rounded-full border"
            >
              <ArrowRight class="size-4" />
            </div>
            <Badge
              variant="outline"
              class="px-3 py-1.5 text-sm bg-background border-primary/20 text-primary flex-1 justify-center"
            >
              {{
                targetSemester
                  ? getSemesterLabel(targetSemester)
                  : 'Tidak ada tujuan'
              }}
            </Badge>
          </div>
        </div>

        <DialogFooter class="pt-2">
          <Button
            variant="outline"
            :disabled="isRollingOver"
            @click="open = false"
          >
            Batal
          </Button>
          <Button
            :disabled="isRollingOver || !sourceSemester || !targetSemester"
            @click="handleConfirmRollover"
          >
            <Loader2
              v-if="isRollingOver"
              class="size-4 mr-1.5 animate-spin"
            />
            <Copy
              v-else
              class="size-4 mr-1.5"
            />
            {{ isRollingOver ? 'Memproses...' : 'Mulai Salin' }}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
