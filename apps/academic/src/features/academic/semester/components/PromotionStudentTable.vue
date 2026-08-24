<script setup lang="ts">
import { computed, nextTick, toRefs, watch } from 'vue'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import {
  Dialog,
  DialogContent,
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
  if (action !== 'REPEAT') {
    approveStudent(studentId)
    return
  }

  // Deferred by one tick, deliberately.
  //
  // This runs inside the select's own close sequence. Opening a modal there
  // means a dialog mounts its overlay while the select is still tearing its
  // own down, and the teardown puts back what it took — `pointer-events` on
  // the document body. Interleaved, the restore can be skipped, and what is
  // left is a page that renders normally and ignores every click: the class
  // filter opens and will not close, and no class can be chosen.
  //
  // Letting the select finish first costs a frame nobody sees.
  void nextTick(() => openDeclineDialog(studentId))
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
    <!-- Filter & Bulk Actions Bar -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Kelas filter -->
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

      <!-- Status filter -->
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
            Disetujui
          </SelectItem>
          <SelectItem
            value="declined"
            class="text-xs"
          >
            Ditolak
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Bulk actions -->
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
              Setujui
            </SelectItem>
            <SelectItem
              value="decline"
              class="text-xs text-destructive focus:text-destructive"
            >
              Tolak
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Pindahkan massal -->
        <Select
          v-if="bulkTargetOptions.length > 0"
          :model-value="undefined"
          :disabled="selectedIds.size === 0"
          @update:model-value="setTargetClassroomForSelected(String($event))"
        >
          <SelectTrigger class="h-8 w-40 text-xs bg-background">
            <SelectValue :placeholder="`Pindahkan ${selectedIds.size} ke...`" />
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
      <Table class="min-w-[850px]">
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="w-[36px] px-3">
              <Checkbox
                :model-value="allVisibleSelected"
                :disabled="filteredRows.length === 0"
                @update:model-value="toggleSelectAll"
              />
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[110px]">
              NIS
            </TableHead>
            <TableHead class="text-left font-semibold text-xs">
              Nama
            </TableHead>
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
              <TableCell class="px-3">
                <Skeleton class="size-4 rounded" />
              </TableCell>
              <TableCell class="text-center py-3">
                <Skeleton class="h-3.5 w-20 mx-auto" />
              </TableCell>
              <TableCell class="py-3">
                <Skeleton class="h-3.5 w-32" />
              </TableCell>
              <TableCell class="text-center py-3">
                <Skeleton class="h-3.5 w-8 mx-auto" />
              </TableCell>
              <TableCell class="text-center py-3">
                <Skeleton class="h-5 w-20 mx-auto rounded-full" />
              </TableCell>
              <TableCell class="text-center py-3">
                <Skeleton class="h-5 w-16 mx-auto rounded-full" />
              </TableCell>
              <TableCell class="text-center py-3">
                <Skeleton class="h-7 w-20 mx-auto rounded-md" />
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
                :colspan="8"
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
                    Silakan pilih salah satu kelas pada filter di atas untuk
                    menampilkan dan memproses kenaikan kelas siswa.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- State Kosong setelah Filter / Pencarian -->
          <template v-else-if="filteredRows.length === 0">
            <TableRow>
              <TableCell
                :colspan="8"
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

          <template v-else>
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
              <TableCell class="text-center py-2.5 text-xs text-foreground">
                {{ row.sourceClassroomName }}
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
                  @update:model-value="
                    setDecision(row.studentId, String($event))
                  "
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
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Decline Reason Dialog -->
    <Dialog v-model:open="showDeclineDialog">
      <DialogContent
        class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader class="px-6 py-4 border-b shrink-0 bg-muted/20">
          <DialogTitle>Alasan Penolakan</DialogTitle>
        </DialogHeader>

        <div class="px-6 py-4 space-y-3">
          <div class="space-y-1.5">
            <Label
              for="promotion-decline-reason"
              class="text-xs font-medium"
            >
              Alasan / Catatan
            </Label>
            <Textarea
              id="promotion-decline-reason"
              v-model="declineReason"
              placeholder="Contoh: Nilai di bawah KKM, kehadiran kurang, dll."
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
          <Button
            variant="destructive"
            size="sm"
            :disabled="!declineReason.trim()"
            @click="handleConfirmDeclineModal"
          >
            Konfirmasi Tolak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
