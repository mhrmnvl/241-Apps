<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { DatePicker } from '@/ui'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Label } from '@/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Calendar, Loader2, Pencil } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useRoleGuard } from '@/features/platform/auth'
import { useStudentGraduation } from '../composables/useStudentGraduation'
import { GraduationStudentTable } from '../components'
import type { GraduationStudentDecision } from '../types'

const { can } = useRoleGuard()

const {
  candidates,
  graduationTerm,
  isLoadingCandidates,
  isGraduating,
  fetchCandidates,
  bulkGraduate,
} = useStudentGraduation()

const selectedClass = ref('')
const graduationDate = ref('')
const isDatePopoverOpen = ref(false)
const decisions = ref<GraduationStudentDecision[]>([])
const showConfirmDialog = ref(false)

const formattedGraduationDate = computed(() => {
  if (!graduationDate.value) return 'Belum diatur'
  try {
    const [y, m, d] = graduationDate.value.split('-').map(Number)
    if (!y || !m || !d) return graduationDate.value
    const date = new Date(y, m - 1, d)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return graduationDate.value
  }
})

function onDecisionsUpdate(updated: GraduationStudentDecision[]) {
  decisions.value = updated
}

function clearGraduationDate() {
  graduationDate.value = ''
  isDatePopoverOpen.value = false
}

// Rekapitulasi keputusan siswa pada kelas terpilih
const summaryStats = computed(() => {
  let approved = 0
  let declined = 0
  for (const d of decisions.value) {
    if (d.approved === false) declined++
    else approved++
  }
  return { approved, declined, total: decisions.value.length }
})

// Daftar baris preview untuk konfirmasi dialog
const previewRows = computed(() => {
  if (!selectedClass.value) return []
  const inClass = candidates.value.filter(
    (c) => c.classroomName === selectedClass.value,
  )
  return inClass.map((c) => {
    const d = decisions.value.find((dec) => dec.studentId === c.studentId)
    return {
      studentId: c.studentId,
      nis: c.nis,
      studentName: c.studentName,
      classroomName: c.classroomName,
      approved: d?.approved !== false,
      declineReason: d?.declineReason,
      previousHold: c.previousHold,
    }
  })
})

// A class where nobody finishes is a real thing to process — the marks are
// not in, everyone is held, and that decision is worth recording. So the gate
// is "some decision was made", not "somebody is graduating".
const canGraduate = computed(
  () =>
    can('graduations.create') &&
    selectedClass.value !== '' &&
    summaryStats.value.total > 0 &&
    !isGraduating.value,
)

function onProcessClick() {
  if (!graduationDate.value) {
    isDatePopoverOpen.value = true
    toast.warning('Silakan tentukan tanggal kelulusan terlebih dahulu.')
    return
  }
  showConfirmDialog.value = true
}

async function load() {
  await fetchCandidates()
}

onMounted(load)

async function handleConfirmGraduate() {
  if (!graduationDate.value) return

  // `note` is a note on the *graduation record*, so only a graduating student
  // can carry one. A held student's reason travels in `held` instead, which
  // the server writes to its own table in the same transaction.
  const graduatingStudents = decisions.value
    .filter((d) => d.approved !== false)
    .map((d) => ({ studentId: d.studentId }))

  // Both halves go together. Sent apart, a run half-succeeds: the graduations
  // land, the holds do not, and the students nobody graduated look like
  // students nobody looked at.
  const heldStudents = decisions.value
    .filter((d) => d.approved === false)
    .map((d) => ({
      studentId: d.studentId,
      // The reason is optional on screen and required on the wire — a hold
      // with no reason is a hold nobody can answer for next year, so an
      // operator who skipped the box still leaves something behind.
      reason: d.declineReason?.trim() || 'Tidak ada alasan yang dicatat',
    }))

  if (graduatingStudents.length === 0 && heldStudents.length === 0) return

  const result = await bulkGraduate({
    graduationDate: graduationDate.value,
    students: graduatingStudents,
    ...(heldStudents.length > 0 && { held: heldStudents }),
  })

  if (result.success) {
    showConfirmDialog.value = false
    graduationDate.value = ''
    selectedClass.value = ''
    await load()
  }
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <!-- Main Card Header -->
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Kelulusan
        </CardTitle>
      </CardHeader>

      <!-- Main Card Body -->
      <div class="p-6 space-y-4">
        <!-- Cohort & Graduation Date Box (Stacked Vertically with aligned colons and normal font) -->
        <div
          class="rounded-xl border bg-muted/20 p-4 space-y-2 text-xs leading-5"
        >
          <div class="flex items-center gap-2">
            <span class="w-[125px] shrink-0 text-muted-foreground"
              >Tahun Ajaran</span
            >
            <span class="text-muted-foreground shrink-0">:</span>
            <span class="text-foreground">
              {{ graduationTerm?.name ?? 'Tahun Aktif' }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="w-[125px] shrink-0 text-muted-foreground"
              >Total Calon</span
            >
            <span class="text-muted-foreground shrink-0">:</span>
            <span class="text-foreground"> {{ candidates.length }} Siswa </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="w-[125px] shrink-0 text-muted-foreground"
              >Tanggal Kelulusan</span
            >
            <span class="text-muted-foreground shrink-0">:</span>
            <div class="flex items-center gap-2">
              <span
                :class="
                  graduationDate
                    ? 'text-foreground'
                    : 'text-amber-600 dark:text-amber-400 font-medium italic'
                "
              >
                {{ formattedGraduationDate }}
              </span>
              <Popover v-model:open="isDatePopoverOpen">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    size="sm"
                    class="h-6 text-[11px] px-2 gap-1 font-normal text-muted-foreground hover:text-foreground"
                  >
                    <Pencil class="size-3" />
                    {{ graduationDate ? 'Ubah' : 'Atur' }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  class="w-auto p-3 space-y-2.5"
                  align="start"
                >
                  <div class="space-y-1">
                    <Label class="text-xs font-medium text-foreground">
                      Pilih Tanggal Kelulusan
                    </Label>
                    <DatePicker
                      v-model="graduationDate"
                      placeholder="Pilih Tanggal Lulus"
                      :allow-future-dates="true"
                      class="h-8 text-xs w-44"
                    />
                  </div>
                  <div class="flex items-center justify-between gap-2 pt-1">
                    <Button
                      v-if="graduationDate"
                      variant="ghost"
                      size="sm"
                      class="h-6 text-[11px] px-2 text-muted-foreground"
                      @click="clearGraduationDate"
                    >
                      Hapus
                    </Button>
                    <div v-else />
                    <Button
                      size="sm"
                      class="h-6 text-[11px] px-2.5"
                      @click="isDatePopoverOpen = false"
                    >
                      Selesai
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <!-- Student Graduation Table Component -->
        <GraduationStudentTable
          :candidates="candidates"
          :is-loading="isLoadingCandidates"
          @update:decisions="onDecisionsUpdate"
          @update:filter-class="selectedClass = $event"
        />

        <!-- Card Footer: Summary & Action -->
        <div
          v-if="selectedClass && summaryStats.total > 0 && !isLoadingCandidates"
          class="-mx-6 -mb-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-6 py-4"
        >
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1.5">
              <div class="size-2.5 rounded-full bg-green-500" />
              <span class="text-muted-foreground">
                Lulus:
                <strong class="text-foreground">{{
                  summaryStats.approved
                }}</strong>
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="size-2.5 rounded-full bg-amber-500" />
              <span class="text-muted-foreground">
                Tidak Lulus:
                <strong class="text-foreground">{{
                  summaryStats.declined
                }}</strong>
              </span>
            </div>
            <div class="text-muted-foreground">
              Total:
              <strong class="text-foreground">{{ summaryStats.total }}</strong>
              Siswa
            </div>
          </div>

          <Button
            size="default"
            class="w-full sm:w-auto font-semibold px-6"
            :disabled="!canGraduate"
            @click="onProcessClick"
          >
            <Loader2
              v-if="isGraduating"
              class="size-4 mr-2 animate-spin"
            />
            Proses Kelulusan
          </Button>
        </div>
      </div>
    </Card>
  </div>

  <!-- Confirmation Dialog (Consistent with Kenaikan Kelas) -->
  <Dialog v-model:open="showConfirmDialog">
    <DialogContent
      class="sm:max-w-3xl flex flex-col gap-0 p-0 overflow-hidden max-h-[90svh]"
    >
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle>Konfirmasi Kelulusan</DialogTitle>
      </DialogHeader>

      <div class="overflow-y-auto px-6 py-4 space-y-4">
        <!-- Student Preview Table -->
        <div class="overflow-x-auto rounded-xl border bg-background shadow-xs">
          <Table class="min-w-[500px]">
            <TableHeader class="bg-muted/50">
              <TableRow>
                <TableHead class="text-center text-xs font-semibold w-[120px]">
                  NIS
                </TableHead>
                <TableHead class="text-xs font-semibold">
                  Nama Siswa
                </TableHead>
                <TableHead class="text-center text-xs font-semibold w-[110px]">
                  Kelas
                </TableHead>
                <TableHead class="text-center text-xs font-semibold w-[120px]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="row in previewRows"
                :key="row.studentId"
                :class="{ 'bg-destructive/5': !row.approved }"
                class="transition-colors"
              >
                <TableCell
                  class="text-center py-2 text-xs text-foreground tabular-nums"
                >
                  {{ row.nis }}
                </TableCell>
                <TableCell class="py-2">
                  <div class="font-medium text-xs text-foreground">
                    {{ row.studentName }}
                  </div>
                  <div
                    v-if="row.declineReason"
                    class="text-[11px] text-destructive italic mt-0.5"
                  >
                    Alasan: {{ row.declineReason }}
                  </div>
                </TableCell>
                <TableCell class="text-center py-2 text-xs text-foreground">
                  {{ row.classroomName }}
                </TableCell>
                <TableCell
                  class="text-center py-2 text-xs font-medium"
                  :class="
                    row.approved
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-destructive'
                  "
                >
                  {{ row.approved ? 'Lulus' : 'Tidak Lulus' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <DialogFooter
        class="px-6 py-3.5 border-t shrink-0 flex flex-col sm:flex-row sm:items-center justify-between sm:justify-between gap-3 w-full"
      >
        <!-- Left side: Summary Stats (paling kiri) -->
        <div class="flex flex-wrap items-center gap-3 text-xs mr-auto">
          <div
            v-if="summaryStats.approved > 0"
            class="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400"
          >
            <div class="size-2 rounded-full bg-green-500" />
            {{ summaryStats.approved }} Lulus
          </div>
          <!-- A count of nothing is not news. The total below still says how
               many are being processed, so nothing is lost by hiding it. -->
          <div
            v-if="summaryStats.declined > 0"
            class="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400"
          >
            <div class="size-2 rounded-full bg-amber-500" />
            {{ summaryStats.declined }} Tidak Lulus
          </div>
          <div class="text-muted-foreground">
            Total:
            <strong class="text-foreground">{{ summaryStats.total }}</strong>
            Siswa
          </div>
          <div
            v-if="graduationDate"
            class="text-muted-foreground flex items-center gap-1"
          >
            <Calendar class="size-3.5" />
            {{ formattedGraduationDate }}
          </div>
        </div>

        <!-- Right side: Primary Action -->
        <div class="flex items-center justify-end gap-2 shrink-0">
          <!-- Same reason as the promotion dialog: graduating a cohort is not
               a step whose only labelled control should be the one that does
               it. -->
          <Button
            variant="outline"
            :disabled="isGraduating"
            @click="showConfirmDialog = false"
          >
            Batal
          </Button>
          <Button
            :disabled="isGraduating"
            @click="handleConfirmGraduate"
          >
            <Loader2
              v-if="isGraduating"
              class="size-4 mr-2 animate-spin"
            />
            Ya, Proses Sekarang
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
