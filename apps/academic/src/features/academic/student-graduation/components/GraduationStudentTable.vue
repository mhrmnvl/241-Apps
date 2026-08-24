<script setup lang="ts">
import { computed, nextTick, ref, toRefs, watch } from 'vue'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
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
import { Skeleton } from '@/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Textarea } from '@/ui/textarea'
import { Filter, Search, Users } from 'lucide-vue-next'
import { useRoleGuard } from '@/features/platform/auth'
import type { GraduationCandidate, GraduationStudentDecision } from '../types'

const props = defineProps<{
  candidates: GraduationCandidate[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:decisions': [decisions: GraduationStudentDecision[]]
  'update:filterClass': [cls: string]
}>()

const { can } = useRoleGuard()
const { candidates } = toRefs(props)

const searchQuery = ref('')
const filterClass = ref('')
const filterStatus = ref('all')
const selectedIds = ref<Set<string>>(new Set())
const decisions = ref<Map<string, GraduationStudentDecision>>(new Map())

// State Modal Alasan Tidak Lulus
const showDeclineDialog = ref(false)
const declineTarget = ref<string | null>(null)
const declineReason = ref('')

function emitDecisions() {
  emit('update:decisions', Array.from(decisions.value.values()))
}

// Daftar kelas unik dari calon lulusan
const uniqueClasses = computed(() => {
  const set = new Set<string>()
  for (const c of candidates.value ?? []) {
    if (c.classroomName) set.add(c.classroomName)
  }
  return Array.from(set).sort()
})

// Calon siswa di kelas terpilih
const currentClassCandidates = computed(() => {
  if (!filterClass.value) return []
  return (candidates.value ?? []).filter(
    (c) => c.classroomName === filterClass.value,
  )
})

function initDecisions() {
  const newClass = filterClass.value
  selectedIds.value = new Set()
  if (!newClass) {
    decisions.value = new Map()
    emitDecisions()
    return
  }

  const inClass = (candidates.value ?? []).filter(
    (c) => c.classroomName === newClass,
  )
  const map = new Map<string, GraduationStudentDecision>()
  for (const item of inClass) {
    const existing = decisions.value.get(item.studentId)
    map.set(
      item.studentId,
      existing ?? {
        studentId: item.studentId,
        approved: true,
        declineReason: undefined,
      },
    )
  }
  decisions.value = map
  emitDecisions()
}

// Reset seleksi dan inisialisasi keputusan saat kelas berganti
watch(filterClass, (newClass) => {
  emit('update:filterClass', newClass)
  initDecisions()
})

// A refetch replaces the array, so its identity is the signal. Walking every
// candidate on every change would cost the same and say no more.
watch(candidates, () => {
  initDecisions()
})

function getDecision(studentId: string): GraduationStudentDecision | undefined {
  return decisions.value.get(studentId)
}

/**
 * Decisions are replaced rather than edited in place.
 *
 * `emitDecisions` hands the parent the very objects held in this map, and the
 * parent keeps them in a ref. Mutating one afterwards would change what the
 * parent holds without an event to say so, so the two could disagree about
 * when a decision was made. A fresh object each time cannot.
 */
function approveStudent(studentId: string) {
  const existing = decisions.value.get(studentId)
  if (!existing) return

  decisions.value.set(studentId, {
    ...existing,
    approved: true,
    declineReason: undefined,
  })
  emitDecisions()
}

function openDeclineDialog(studentId: string) {
  declineTarget.value = studentId
  declineReason.value = decisions.value.get(studentId)?.declineReason || ''
  showDeclineDialog.value = true
}

function hold(studentId: string, reason?: string) {
  const existing = decisions.value.get(studentId)
  if (!existing) return

  decisions.value.set(studentId, {
    ...existing,
    approved: false,
    declineReason: reason,
  })
}

function handleConfirmDecline() {
  const reason = declineReason.value.trim() || undefined

  if (declineTarget.value) {
    hold(declineTarget.value, reason)
  } else {
    // Only what is on screen: a tick made in another class is not an answer
    // about this one.
    for (const candidate of filteredCandidates.value) {
      if (selectedIds.value.has(candidate.studentId)) {
        hold(candidate.studentId, reason)
      }
    }
  }

  emitDecisions()
  showDeclineDialog.value = false
  declineTarget.value = null
  declineReason.value = ''
}

function setDecision(studentId: string, action: string) {
  if (action !== 'HOLD') {
    approveStudent(studentId)
    return
  }

  // Deferred for the same reason as the promotion table: opening a modal from
  // inside a select's close sequence can leave the body's `pointer-events`
  // restore unrun, and the page then ignores every click.
  void nextTick(() => openDeclineDialog(studentId))
}

function bulkApprove() {
  for (const candidate of filteredCandidates.value) {
    if (selectedIds.value.has(candidate.studentId)) {
      approveStudent(candidate.studentId)
    }
  }
}

function bulkDecline() {
  declineTarget.value = null
  declineReason.value = ''
  showDeclineDialog.value = true
}

// Calon siswa yang difilter berdasarkan kelas, search, dan status keputusan
const filteredCandidates = computed(() => {
  if (!filterClass.value) return []

  const q = searchQuery.value.trim().toLowerCase()
  const status = filterStatus.value

  return currentClassCandidates.value.filter((c) => {
    const matchSearch =
      !q ||
      c.studentName?.toLowerCase().includes(q) ||
      c.nis?.toLowerCase().includes(q)

    let matchStatus = true
    const d = decisions.value.get(c.studentId)
    if (status === 'approved') matchStatus = d?.approved === true
    if (status === 'declined') matchStatus = d?.approved === false

    return matchSearch && matchStatus
  })
})

const allVisibleSelected = computed(
  () =>
    filteredCandidates.value.length > 0 &&
    filteredCandidates.value.every((c) => selectedIds.value.has(c.studentId)),
)

function toggle(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleAllVisible() {
  const next = new Set(selectedIds.value)
  if (allVisibleSelected.value) {
    for (const c of filteredCandidates.value) {
      next.delete(c.studentId)
    }
  } else {
    for (const c of filteredCandidates.value) {
      next.add(c.studentId)
    }
  }
  selectedIds.value = next
}
</script>

<template>
  <div class="space-y-4">
    <!-- Filter & Bulk Actions Bar -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Kelas Filter -->
      <!-- Disabled rather than empty: a dropdown with no items opens onto
           nothing and cannot be closed by choosing. -->
      <Select
        v-model="filterClass"
        :disabled="uniqueClasses.length === 0"
      >
        <SelectTrigger class="h-8 text-xs bg-background w-36">
          <Filter class="size-3 mr-1 text-muted-foreground" />
          <SelectValue placeholder="Pilih Kelas..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="cls in uniqueClasses"
            :key="cls"
            :value="cls"
            class="text-xs"
          >
            {{ cls }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Status Filter -->
      <Select
        v-model="filterStatus"
        :disabled="!filterClass"
      >
        <SelectTrigger class="h-8 text-xs bg-background w-32">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="all"
            class="text-xs"
          >
            Semua Status
          </SelectItem>
          <SelectItem
            value="approved"
            class="text-xs"
          >
            Lulus
          </SelectItem>
          <SelectItem
            value="declined"
            class="text-xs"
          >
            Tidak Lulus
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Bulk Actions -->
      <template v-if="filterClass">
        <!-- Bulk actions select dropdown -->
        <Select
          :model-value="undefined"
          :disabled="selectedIds.size === 0"
          @update:model-value="
            (val) => {
              if (val === 'approve') bulkApprove()
              if (val === 'decline') void nextTick(bulkDecline)
            }
          "
        >
          <SelectTrigger class="h-8 text-xs bg-background w-36">
            <SelectValue
              :placeholder="
                selectedIds.size > 0
                  ? `Aksi (${selectedIds.size})`
                  : 'Aksi Massal'
              "
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="approve"
              class="text-xs text-green-600 focus:text-green-600"
            >
              Luluskan
            </SelectItem>
            <SelectItem
              value="decline"
              class="text-xs text-destructive focus:text-destructive"
            >
              Tolak
            </SelectItem>
          </SelectContent>
        </Select>
      </template>
    </div>

    <!-- Table Header Toolbar (Search Box directly above DataTable) -->
    <div class="flex items-center justify-end w-full">
      <div class="relative w-full sm:w-48 max-w-[200px]">
        <Search
          class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          placeholder="Cari siswa..."
          :disabled="!filterClass"
          class="h-8 pl-8 w-full text-xs"
        />
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto rounded-xl border bg-background shadow-xs">
      <Table class="min-w-[650px]">
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="w-[36px] px-3">
              <Checkbox
                :model-value="allVisibleSelected"
                :disabled="
                  !can('graduations.create') || filteredCandidates.length === 0
                "
                @update:model-value="toggleAllVisible"
              />
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[120px]">
              NIS
            </TableHead>
            <TableHead class="text-left font-semibold text-xs">
              Nama Siswa
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[110px]">
              Kelas
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[130px]">
              Keputusan
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading Skeletons -->
          <template v-if="isLoading">
            <TableRow
              v-for="i in 5"
              :key="i"
            >
              <TableCell class="px-3">
                <Skeleton class="size-4 rounded" />
              </TableCell>
              <TableCell class="text-center py-3">
                <Skeleton class="h-3.5 w-20 mx-auto" />
              </TableCell>
              <TableCell class="py-3">
                <Skeleton class="h-3.5 w-40" />
              </TableCell>
              <TableCell class="text-center py-3">
                <Skeleton class="h-3.5 w-12 mx-auto" />
              </TableCell>
              <TableCell class="text-center py-3">
                <Skeleton class="h-7 w-24 mx-auto rounded-md" />
              </TableCell>
            </TableRow>
          </template>

          <!-- State Belum Memilih Kelas -->
          <template v-else-if="!filterClass">
            <TableRow>
              <TableCell
                colspan="5"
                class="py-14 text-center"
              >
                <div
                  class="flex flex-col items-center gap-2 text-muted-foreground"
                >
                  <Filter class="size-8 opacity-40" />
                  <p class="text-xs font-medium text-foreground">
                    Pilih kelas terlebih dahulu
                  </p>
                  <p class="text-[11px] max-w-sm">
                    Silakan pilih salah satu kelas tingkat akhir pada filter di
                    atas untuk menampilkan dan memproses kelulusan siswa.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- State Kosong setelah Filter / Pencarian -->
          <template v-else-if="filteredCandidates.length === 0">
            <TableRow>
              <TableCell
                colspan="5"
                class="py-12 text-center"
              >
                <div
                  class="flex flex-col items-center gap-2 text-muted-foreground"
                >
                  <Users class="size-8 opacity-40" />
                  <p class="text-xs font-medium text-foreground">
                    Tidak ada siswa yang sesuai dengan filter pencarian
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Candidate Rows -->
          <template v-else>
            <TableRow
              v-for="candidate in filteredCandidates"
              :key="candidate.studentId"
              class="transition-colors hover:bg-muted/30"
              :class="{
                'bg-destructive/5':
                  getDecision(candidate.studentId)?.approved === false,
              }"
            >
              <TableCell class="px-3">
                <Checkbox
                  :model-value="selectedIds.has(candidate.studentId)"
                  :disabled="!can('graduations.create')"
                  @update:model-value="toggle(candidate.studentId)"
                />
              </TableCell>
              <TableCell
                class="text-center py-2.5 text-xs text-foreground tabular-nums"
              >
                {{ candidate.nis }}
              </TableCell>
              <TableCell class="py-2.5">
                <div class="font-semibold text-xs text-foreground">
                  {{ candidate.studentName }}
                </div>
                <div
                  v-if="getDecision(candidate.studentId)?.declineReason"
                  class="text-[11px] text-destructive mt-0.5 italic"
                >
                  Alasan: {{ getDecision(candidate.studentId)?.declineReason }}
                </div>
                <!-- A hold does not take anyone off this list, so a student
                     held last year arrives again looking like anyone else.
                     Whoever is deciding now needs to know that. -->
                <div
                  v-if="candidate.previousHold"
                  class="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5"
                >
                  Ditahan {{ candidate.previousHold.academicYearName }}:
                  {{ candidate.previousHold.reason }}
                </div>
              </TableCell>
              <TableCell class="text-center py-2.5 text-xs text-foreground">
                {{ candidate.classroomName }}
              </TableCell>
              <TableCell class="text-center py-2.5">
                <Select
                  :model-value="
                    getDecision(candidate.studentId)?.approved === false
                      ? 'HOLD'
                      : 'GRADUATE'
                  "
                  :disabled="!can('graduations.create')"
                  @update:model-value="
                    setDecision(candidate.studentId, String($event))
                  "
                >
                  <SelectTrigger
                    class="h-7 w-full text-[11px]"
                    :class="
                      getDecision(candidate.studentId)?.approved === false
                        ? 'text-destructive border-destructive/50'
                        : ''
                    "
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="GRADUATE"
                      class="text-xs"
                    >
                      Lulus
                    </SelectItem>
                    <SelectItem
                      value="HOLD"
                      class="text-xs"
                    >
                      Tidak Lulus
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>

  <!-- Modal Alasan Penolakan / Tidak Lulus -->
  <Dialog v-model:open="showDeclineDialog">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-4 border-b shrink-0 bg-muted/20">
        <DialogTitle>Alasan Tidak Lulus</DialogTitle>
        <DialogDescription class="text-xs">
          Siswa ini tidak diikutkan dalam proses kelulusan kali ini. Alasannya
          hanya tampil di layar sebagai pengingat selama pengecekan — tidak ada
          tempat menyimpannya, jadi ia hilang saat halaman dimuat ulang.
        </DialogDescription>
      </DialogHeader>

      <div class="px-6 py-4 space-y-3">
        <div class="space-y-1.5">
          <Label
            for="graduation-decline-reason"
            class="text-xs font-medium"
          >
            Alasan / Catatan (opsional)
          </Label>
          <Textarea
            id="graduation-decline-reason"
            v-model="declineReason"
            placeholder="Contoh: Nilai belum lengkap / tidak memenuhi syarat..."
            rows="3"
            class="text-xs resize-none"
          />
        </div>
      </div>

      <DialogFooter
        class="border-t px-6 py-3 flex justify-end gap-2 bg-muted/10"
      >
        <Button
          variant="outline"
          size="sm"
          @click="showDeclineDialog = false"
        >
          Batal
        </Button>
        <!-- Not disabled on an empty reason: requiring something that is then
             thrown away is worse than letting it be left blank. -->
        <Button
          variant="destructive"
          size="sm"
          @click="handleConfirmDecline"
        >
          Tandai Tidak Lulus
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
