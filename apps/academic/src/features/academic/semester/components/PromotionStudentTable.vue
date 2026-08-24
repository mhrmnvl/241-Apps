<script setup lang="ts">
import { computed, toRefs, watch } from 'vue'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
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
import { CheckCircle2, Filter, Search, XCircle } from 'lucide-vue-next'
import type {
  PromotionAction,
  PromotionRecommendationItem,
  PromotionStudentDecision,
} from '../types'
import { usePromotionTable } from '../composables/usePromotionTable'
import type { Classroom } from '@/features/academic/classroom'

const props = defineProps<{
  recommendations: PromotionRecommendationItem[]
  isLoading?: boolean
  /** Every class the year ahead has, filtered per row to the allowed level. */
  targetClassrooms?: Classroom[]
}>()

const emit = defineEmits<{
  'update:decisions': [decisions: PromotionStudentDecision[]]
  'update:filterClass': [cls: string]
}>()

const { recommendations } = toRefs(props)
const recommendationsRef = computed(() => recommendations.value ?? [])

const table = usePromotionTable(recommendationsRef, (decisions) => {
  emit('update:decisions', decisions)
})

const {
  searchQuery,
  filterClass,
  filterStatus,
  selectedIds,
  selectedVisibleRows,
  showDeclineDialog,
  declineReason,
  uniqueClasses,
  filteredRows,
  allVisibleSelected,
  toggleSelectAll,
  toggleSelect,
  getDecision,
  approveStudent,
  setTargetClassroom,
  setTargetClassroomForSelected,
  openDeclineDialog,
  bulkApprove,
  bulkDecline,
  handleConfirmDeclineModal,
} = table

watch(filterClass, (cls) => {
  emit('update:filterClass', cls)
})

function getActionLabel(action: PromotionAction) {
  switch (action) {
    case 'PROMOTE':
      return 'Naik Kelas'
    case 'REPEAT':
      return 'Tinggal Kelas'
    default:
      return action
  }
}

function getActionVariant(action: PromotionAction) {
  switch (action) {
    case 'PROMOTE':
      return 'default' as const
    case 'REPEAT':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function formatScore(score?: number | null) {
  if (score == null) return '-'
  return score.toFixed(1)
}

/** Resolve the target classroom name for a student based on their current decision. */
/**
 * Where this row is allowed to go.
 *
 * The server refuses a destination at the wrong level — up for PROMOTE, the
 * same for REPEAT — so offering one would only produce a rejection after the
 * confirmation. A held-back student is offered their own grade; everyone else
 * the grade above.
 */
function targetOptionsFor(row: PromotionRecommendationItem): Classroom[] {
  const decision = getDecision(row.studentId)
  const wantedGrade =
    decision && !decision.approved ? row.sourceLevel : row.targetLevel
  if (!wantedGrade) return []

  return (props.targetClassrooms ?? []).filter(
    (classroom) => classroom.grade?.name === wantedGrade,
  )
}

/** The class chosen for this row, which starts as the recommended one. */
function chosenTargetFor(row: PromotionRecommendationItem): string {
  return getDecision(row.studentId)?.targetClassroomId ?? ''
}

const bulkTargetOptions = computed(() => {
  const chosen = selectedVisibleRows.value
  if (chosen.length === 0) return []

  const grades = new Set(
    chosen.map((row) => {
      const decision = getDecision(row.studentId)
      return decision && !decision.approved ? row.sourceLevel : row.targetLevel
    }),
  )

  // A selection spanning both decisions is going to two grades at once, and
  // one list cannot answer for both.
  if (grades.size !== 1) return []

  const [grade] = [...grades]
  if (!grade) return []

  return (props.targetClassrooms ?? []).filter(
    (classroom) => classroom.grade?.name === grade,
  )
})

/**
 * Turns the chosen word into the decision it stands for.
 *
 * Declining needs a reason before it means anything — the server refuses a
 * REPEAT without one — so it opens the dialog rather than writing the decision
 * straight away. Closing that dialog leaves the row as it was, and the
 * dropdown goes back to showing that, which is what a cancelled choice should
 * look like.
 */
function setDecision(studentId: string, action: string) {
  if (action === 'REPEAT') openDeclineDialog(studentId)
  else approveStudent(studentId)
}

/** What the dropdown shows: the decision on record, not the recommendation. */
function decisionValueFor(row: PromotionRecommendationItem): PromotionAction {
  return getDecision(row.studentId)?.approved === false ? 'REPEAT' : 'PROMOTE'
}

/**
 * The destination in words, for when there is no list to choose from.
 *
 * Only reached when `targetOptionsFor` comes back empty — a failed fetch, or a
 * grade the year ahead has no classes for — so it has to be right about a
 * held-back student, who stays in the grade they were already in rather than
 * going to the class worked out for a promotion.
 */
function getTargetClass(row: PromotionRecommendationItem): string {
  const decision = getDecision(row.studentId)
  if (decision && !decision.approved) {
    return `Tinggal (${row.sourceClassroomName})`
  }
  return row.targetClassroomName ?? '-'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Filter Bar -->
    <div class="rounded-lg border bg-muted/20 p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
        <!-- Search -->
        <div class="relative flex-1">
          <Search
            class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Cari nama / NIS..."
            class="pl-8 h-9 text-xs"
          />
        </div>

        <!-- Kelas filter -->
        <Select v-model="filterClass">
          <SelectTrigger class="h-9 text-xs bg-background sm:w-44">
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

        <!-- Status filter -->
        <Select v-model="filterStatus">
          <SelectTrigger class="h-9 text-xs bg-background sm:w-40">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              class="text-xs"
              >Semua Status</SelectItem
            >
            <SelectItem
              value="approved"
              class="text-xs"
              >Disetujui</SelectItem
            >
            <SelectItem
              value="declined"
              class="text-xs"
              >Ditolak</SelectItem
            >
          </SelectContent>
        </Select>

        <!-- Bulk actions -->
        <div class="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            class="h-9 text-xs font-medium"
            :disabled="selectedIds.size === 0"
            @click="bulkApprove"
          >
            <CheckCircle2 class="size-3.5 mr-1 text-green-600" />
            Setujui ({{ selectedIds.size }})
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="h-9 text-xs font-medium text-destructive hover:text-destructive"
            :disabled="selectedIds.size === 0"
            @click="bulkDecline"
          >
            <XCircle class="size-3.5 mr-1" />
            Tolak ({{ selectedIds.size }})
          </Button>

          <!-- A school that reshuffles its classes moves a group at a time.
               The selection survives the choice, so a wrong pick is undone by
               choosing again rather than by re-ticking thirty rows. -->
          <Select
            v-if="bulkTargetOptions.length > 0"
            :model-value="''"
            :disabled="selectedIds.size === 0"
            @update:model-value="setTargetClassroomForSelected(String($event))"
          >
            <SelectTrigger class="h-9 w-44 text-xs">
              <SelectValue
                :placeholder="`Pindahkan ${selectedIds.size} ke...`"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in bulkTargetOptions"
                :key="option.id"
                :value="option.id"
                class="text-xs"
              >
                {{ option.code }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-xl border bg-background shadow-xs">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="w-[36px] px-3">
              <Checkbox
                :model-value="allVisibleSelected"
                @update:model-value="toggleSelectAll"
              />
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[110px]">
              NIS
            </TableHead>
            <TableHead class="text-left font-semibold text-xs">Nama</TableHead>
            <TableHead class="text-center font-semibold text-xs w-[70px]">
              Nilai
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[120px]">
              Rekomendasi
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[100px]">
              Kelas Asal
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[120px]">
              Kelas Tujuan
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[130px]">
              Keputusan
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading skeleton rows -->
          <template v-if="isLoading">
            <TableRow
              v-for="i in 6"
              :key="i"
            >
              <TableCell class="px-3"
                ><Skeleton class="size-4 rounded"
              /></TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-3.5 w-20 mx-auto"
              /></TableCell>
              <TableCell class="py-3"
                ><Skeleton class="h-3.5 w-32"
              /></TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-3.5 w-8 mx-auto"
              /></TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-5 w-20 mx-auto rounded-full"
              /></TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-5 w-16 mx-auto rounded-full"
              /></TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-7 w-20 mx-auto rounded-md"
              /></TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-7 w-24 mx-auto rounded-md"
              /></TableCell>
            </TableRow>
          </template>

          <TableRow
            v-for="row in filteredRows"
            :key="row.studentId"
            class="transition-colors hover:bg-muted/30"
            :class="{
              'bg-destructive/5':
                getDecision(row.studentId)?.approved === false,
            }"
          >
            <TableCell class="px-3">
              <Checkbox
                :model-value="selectedIds.has(row.studentId)"
                @update:model-value="toggleSelect(row.studentId)"
              />
            </TableCell>
            <TableCell
              class="text-center py-2.5 text-xs text-foreground tabular-nums"
            >
              {{ row.nis }}
            </TableCell>
            <TableCell class="py-2.5">
              <div class="font-semibold text-xs text-foreground">
                {{ row.studentName }}
              </div>
              <!-- The reason belongs beside the name it is about; a column of
                   its own would be empty for everyone who is naik kelas. -->
              <div
                v-if="getDecision(row.studentId)?.declineReason"
                class="text-[11px] text-destructive mt-0.5 italic"
              >
                Alasan: {{ getDecision(row.studentId)?.declineReason }}
              </div>
            </TableCell>
            <TableCell class="text-center py-2.5">
              <span
                class="font-semibold tabular-nums text-xs"
                :class="
                  row.averageScore != null
                    ? row.averageScore >= 75
                      ? 'text-green-600'
                      : 'text-amber-600'
                    : 'text-muted-foreground'
                "
              >
                {{ formatScore(row.averageScore) }}
              </span>
            </TableCell>
            <!-- What the server worked out, and only that. It used to be overwritten
                 by the decision, which made the column agree with Keputusan by
                 construction and left nothing to check a decision against. -->
            <TableCell class="text-center py-2.5">
              <Badge
                :variant="getActionVariant(row.recommendedAction)"
                class="font-medium text-[10px] px-2 py-0.5 shadow-none"
              >
                {{ getActionLabel(row.recommendedAction) }}
              </Badge>
            </TableCell>
            <TableCell class="text-center py-2.5">
              <Badge
                variant="outline"
                class="font-medium bg-transparent text-[11px] px-2 py-0.5"
              >
                {{ row.sourceClassroomName }}
              </Badge>
            </TableCell>

            <!-- Kelas Tujuan is the picker itself, not a picker standing next
                 to a label that says the same thing: what the recommendation
                 chose is what the dropdown already shows as selected.

                 The badge is the fallback for when there is nothing to choose
                 between — a failed fetch, or a level the year ahead has no
                 classes for — so the destination stays visible and the
                 promotion still runs. -->
            <TableCell class="text-center py-2.5">
              <Select
                v-if="targetOptionsFor(row).length > 0"
                :model-value="chosenTargetFor(row)"
                @update:model-value="
                  setTargetClassroom(row.studentId, String($event))
                "
              >
                <SelectTrigger
                  class="h-7 w-20 mx-auto text-[11px] justify-center text-center px-2 [&_svg]:hidden [&_[data-slot=select-value]]:justify-center"
                  :class="
                    chosenTargetFor(row)
                      ? ''
                      : 'border-destructive text-destructive'
                  "
                >
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in targetOptionsFor(row)"
                    :key="option.id"
                    :value="option.id"
                    class="text-xs"
                  >
                    {{ option.code }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Badge
                v-else
                :variant="
                  getDecision(row.studentId)?.approved === false
                    ? 'destructive'
                    : 'secondary'
                "
                class="font-medium text-[11px] px-2 py-0.5"
              >
                {{ getTargetClass(row) }}
              </Badge>
            </TableCell>

            <!-- One answer with two values, so it is shaped like one control.
                 Two ghost buttons read as two things you could do, and until
                 one was pressed neither looked chosen — even though every row
                 arrives already decided. -->
            <TableCell class="text-center py-2.5">
              <Select
                :model-value="decisionValueFor(row)"
                @update:model-value="setDecision(row.studentId, String($event))"
              >
                <SelectTrigger
                  class="h-7 w-full text-[11px]"
                  :class="
                    getDecision(row.studentId)?.approved === false
                      ? 'text-destructive border-destructive/50'
                      : ''
                  "
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="PROMOTE"
                    class="text-xs"
                  >
                    Naik Kelas
                  </SelectItem>
                  <SelectItem
                    value="REPEAT"
                    class="text-xs"
                  >
                    Tinggal Kelas
                  </SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>

          <TableRow v-if="!isLoading && filteredRows.length === 0">
            <TableCell
              colspan="8"
              class="p-10 text-center"
            >
              <div
                class="flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
              >
                <Users class="size-5 opacity-30" />
                <p class="font-medium text-xs">
                  {{
                    !filterClass
                      ? 'Pilih kelas untuk menampilkan siswa'
                      : 'Tidak ada siswa ditemukan'
                  }}
                </p>
                <p class="text-[11px]">
                  {{
                    !filterClass
                      ? 'Gunakan filter kelas di atas untuk memulai review.'
                      : 'Coba ubah filter atau kata pencarian.'
                  }}
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Decline Reason Dialog -->
    <Dialog v-model:open="showDeclineDialog">
      <DialogScrollContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alasan Penolakan</DialogTitle>
          <DialogDescription>
            Wajib diisi — keputusan Tinggal Kelas tanpa alasan akan ditolak
            server. Alasan disimpan sebagai catatan pada data enrolmen tahun
            ajaran yang ditutup; belum ada halaman yang menampilkannya kembali.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Textarea
            v-model="declineReason"
            placeholder="Contoh: Nilai di bawah KKM, kehadiran kurang, dll."
            class="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showDeclineDialog = false"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            :disabled="!declineReason.trim()"
            @click="handleConfirmDeclineModal"
          >
            Konfirmasi Tolak
          </Button>
        </DialogFooter>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
