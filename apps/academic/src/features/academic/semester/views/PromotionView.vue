<script setup lang="ts">
import type {
  PromotionPayload,
  PromotionResult,
  PromotionStudentDecision,
  PromotionStudentPayload,
} from '../types'
import { PromotionResultDialog, PromotionStudentTable } from '../components'
import { RouterLink, useRouter } from 'vue-router'
import {
  Dialog,
  DialogContent,
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
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Pencil,
  XCircle,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useSemesterList } from '../composables/useSemesterList'
import { useSemesterPromotion } from '../composables/useSemesterPromotion'
import { derivePromotionYears } from '../logic/derivePromotionYears'
import { selectableTargetYears } from '../logic/selectableTargetYears'
import { classroomApi } from '@/features/academic/classroom'
import { classroomService } from '@/features/academic/classroom'
import type { Classroom } from '@/features/academic/classroom'

const router = useRouter()

const { academicYears, fetchAcademicYears } = useSemesterList()
const {
  isPromoting,
  isPreviewing,
  promotionPreview,
  isLoadingRecommendations,
  promotionRecommendations,
  excludedGraduatingCount,
  fetchPromotionRecommendation,
  previewPromotion,
  executePromotion,
} = useSemesterPromotion()

// Academic years, not semesters. Kenaikan kelas moves a student between years;
// moving between the terms of one year is a rollover and has its own screen.
// Which term of each year is read and written is the server's call — see
// `PromotionSemesterResolver` — so this screen cannot pair two terms of the
// same year, which it used to be able to do in two clicks.
const sourceAcademicYearId = ref('')
const targetAcademicYearId = ref('')

/**
 * A promotion runs out of the year the school is in and into the one after it,
 * so the screen works that out instead of asking. `derivePromotionYears` holds
 * the rule and is spec'd against it.
 *
 * Shown as a sentence rather than hidden: this moves every student in the
 * school, once a year, and the value of stating it is that somebody can stop
 * before it happens.
 */
const derived = computed(() => derivePromotionYears(academicYears.value))

/**
 * The override exists for the school that ran a year late.
 *
 * Activating next year before promoting out of this one is an ordinary
 * mistake — and after it, the derived pair is wrong in exactly the way nobody
 * would notice. Folded away, because that is a rare day.
 */
const isChoosingYears = ref(false)
const isCopyingClassrooms = ref(false)

/**
 * Students the server could find no destination for.
 *
 * Always the same cause: the year ahead has no classroom at the level they are
 * moving into. The recommendation itself works out which level follows which
 * from the levels present in the target year, so a year holding one class
 * leaves almost everybody here.
 */
const studentsWithoutTarget = computed(() =>
  promotionRecommendations.value.filter((rec) => !rec.targetClassroomId),
)

/**
 * The classes the year ahead has, so a student can be sent somewhere other
 * than the one recommended for them.
 *
 * Fetched rather than derived from the recommendation, which names only the
 * class it chose. The server validates the destination — right year, and a
 * level that goes up for PROMOTE or stays put for REPEAT — so the table
 * filters this list to the level each row is allowed.
 */
const targetClassrooms = ref<Classroom[]>([])

async function loadTargetClassrooms(academicYearId: string) {
  try {
    const res = await classroomApi.getClassrooms({
      academicYearId,
      limit: 200,
    })
    targetClassrooms.value = res.data.data ?? []
  } catch {
    // A missing list costs the picker, not the promotion: every row keeps the
    // destination the server recommended, and the run still works.
    targetClassrooms.value = []
  }
}

/**
 * Only the class on screen.
 *
 * The class filter is not optional — nothing is listed until one is chosen —
 * so the screen reads as being about that class. The button used to cover
 * every class behind it, which meant reviewing VII-A and promoting all four.
 */
const decisionsForSelectedClass = computed(() => {
  if (!selectedClass.value) return []
  const inClass = new Set(
    promotionRecommendations.value
      .filter((rec) => rec.sourceClassroomName === selectedClass.value)
      .map((rec) => rec.studentId),
  )
  return studentDecisions.value.filter((d) => inClass.has(d.studentId))
})

/**
 * Gives the year ahead the classes this one has, then asks again.
 *
 * Copying is idempotent server-side, so pressing this twice is harmless — and
 * a year part-filled by hand keeps what is already in it.
 */
async function copyClassroomsForward() {
  const source = sourceAcademicYearId.value
  const target = targetAcademicYearId.value
  if (!source || !target) return

  isCopyingClassrooms.value = true
  try {
    const outcome = await classroomService.copyClassroomsToAcademicYear(
      source,
      target,
    )
    if (outcome.success) {
      // The picker's options are among what was just created, so both are
      // refreshed — otherwise the new classes exist but cannot be chosen.
      await Promise.all([
        fetchPromotionRecommendation({
          sourceAcademicYearId: source,
          targetAcademicYearId: target,
        }),
        loadTargetClassrooms(target),
      ])
    }
  } finally {
    isCopyingClassrooms.value = false
  }
}
const studentDecisions = ref<PromotionStudentDecision[]>([])

/**
 * The class the table is filtered to, which is also what the button acts on.
 *
 * Reported by the table rather than owned here: the filter is its control, and
 * two copies of the same choice is one more thing that can disagree.
 */
const selectedClass = ref('')
const showConfirmDialog = ref(false)
const showResultDialog = ref(false)
const promotionResult = ref<PromotionResult | null>(null)

/**
 * Forward only. The override is for a school that ran a year late, not for
 * sending a cohort back into a year it has already finished — and the server
 * would accept that, because a backward promotion still passes its "grade goes
 * up" check. `selectableTargetYears` holds the rule and its spec.
 */
const availableTargetYears = computed(() =>
  selectableTargetYears(academicYears.value, sourceAcademicYearId.value),
)

const canExecute = computed(() => {
  if (!sourceAcademicYearId.value || !targetAcademicYearId.value) return false
  if (isLoadingRecommendations.value || isPromoting.value) return false
  // One class at a time, and only the one on screen. Nothing is listed until
  // a class is chosen, so promoting more than that was promoting unseen.
  if (!selectedClass.value) return false
  if (decisionsForSelectedClass.value.length === 0) return false

  return decisionsForSelectedClass.value.every((d) => {
    if (!d.approved && !d.declineReason) return false
    // Every decision needs a classroom, including a student held back — they
    // still enrol somewhere, in the grade they were already in. The server
    // refuses a decision without one, so catching it here keeps the button
    // from promising a run that would be rejected on arrival.
    if (!d.targetClassroomId) return false
    return true
  })
})

/** About the class on screen, which is what the button acts on. */
const summaryStats = computed(() => {
  let approved = 0
  let declined = 0
  for (const d of decisionsForSelectedClass.value) {
    if (d.approved) approved++
    else declined++
  }
  return {
    approved,
    declined,
    total: decisionsForSelectedClass.value.length,
  }
})

/** Rows shown in the confirm-dialog preview. */
const previewRows = computed(() => {
  return decisionsForSelectedClass.value.map((d) => {
    const rec = promotionRecommendations.value.find(
      (r) => r.studentId === d.studentId,
    )
    const targetName =
      targetClassrooms.value.find((c) => c.id === d.targetClassroomId)?.code ??
      rec?.targetClassroomName ??
      '-'
    return {
      studentId: d.studentId,
      studentName: rec?.studentName ?? '-',
      nis: rec?.nis ?? '-',
      sourceClass: rec?.sourceClassroomName ?? '-',
      targetClass:
        targetName !== '-' ? targetName : (rec?.sourceClassroomName ?? '-'),
      approved: d.approved,
      declineReason: d.declineReason,
    }
  })
})

function buildPayload(): PromotionPayload {
  const students: PromotionStudentPayload[] = decisionsForSelectedClass.value
    // Provably empty by the time this runs — `canExecute` gates the only
    // caller on every decision having a classroom. It is a filter rather than
    // a non-null assertion so that if that gate is ever loosened, the payload
    // narrows instead of carrying `undefined` into the request.
    .filter(
      (d): d is typeof d & { targetClassroomId: string } =>
        d.targetClassroomId !== undefined,
    )
    .map((d) => ({
      studentId: d.studentId,
      sourceClassroomId: d.sourceClassroomId,
      targetClassroomId: d.targetClassroomId,
      action: d.approved ? d.action : ('REPEAT' as const),
      declineReason: d.approved ? undefined : d.declineReason,
    }))

  return {
    sourceAcademicYearId: sourceAcademicYearId.value,
    targetAcademicYearId: targetAcademicYearId.value,
    students,
  }
}

/**
 * Opens the confirmation, and asks the server what it makes of the payload.
 *
 * The numbers in the dialog then come from the same request that is about to
 * be sent, counted by the side that will act on it — rather than from the
 * screen agreeing with itself. `summaryStats` still stands behind it, so a
 * preview that fails to load costs the reassurance and not the operation.
 */
function openConfirmDialog() {
  showConfirmDialog.value = true
  void previewPromotion(buildPayload())
}

async function handleExecute() {
  showConfirmDialog.value = false
  const result = await executePromotion(buildPayload())
  if (result.success) {
    promotionResult.value = result.result ?? null
    showResultDialog.value = true
  }
}

function handleDone() {
  showResultDialog.value = false
  void router.push('/academic/semester')
}

function onDecisionsUpdate(decisions: PromotionStudentDecision[]) {
  studentDecisions.value = decisions
}

// Changing the source can strand the target behind it — picking 2027/2028 as
// the source while 2026/2027 is selected as the target leaves a backward pair
// that the list no longer offers but the state still holds. Clearing anything
// the list would not offer keeps the two in step.
watch(sourceAcademicYearId, () => {
  const stillOffered = availableTargetYears.value.some(
    (year) => year.id === targetAcademicYearId.value,
  )
  if (!stillOffered) {
    targetAcademicYearId.value = ''
  }
})

watch(
  [sourceAcademicYearId, targetAcademicYearId],
  async ([source, target]) => {
    if (source && target) {
      await Promise.all([
        fetchPromotionRecommendation({
          sourceAcademicYearId: source,
          targetAcademicYearId: target,
        }),
        loadTargetClassrooms(target),
      ])
    }
  },
)

onMounted(async () => {
  await fetchAcademicYears()

  // Only seeds the fields; an operator who has already picked something keeps
  // it, and a run started before the list arrived is not overwritten.
  if (!sourceAcademicYearId.value && derived.value.source) {
    sourceAcademicYearId.value = derived.value.source.id
  }
  if (!targetAcademicYearId.value && derived.value.target) {
    targetAcademicYearId.value = derived.value.target.id
  }
})
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
          Kenaikan Kelas
        </CardTitle>
      </CardHeader>

      <!-- Main Card Body -->
      <div class="p-6 space-y-4">
        <!-- Stated, not asked. The pair is derived; the selects are the way
             back for a school that ran a year late. -->
        <div
          v-if="!isChoosingYears"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3"
        >
          <div
            class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs"
          >
            <span class="text-muted-foreground font-medium"
              >Siklus Kenaikan:</span
            >
            <span class="font-semibold text-foreground">
              {{ derived.source?.name ?? 'Tahun Aktif' }}
            </span>
            <ArrowRight class="size-3.5 text-muted-foreground shrink-0" />
            <span
              v-if="derived.target"
              class="font-semibold text-foreground"
            >
              {{ derived.target.name }}
            </span>
            <span
              v-else
              class="font-medium text-destructive"
            >
              Tahun ajaran target belum dibuat
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            class="h-8 text-xs font-medium shrink-0 self-center sm:self-auto"
            @click="isChoosingYears = true"
          >
            <Pencil class="size-3.5 mr-1.5 text-muted-foreground" />
            Ubah Tahun
          </Button>
        </div>

        <div
          v-else
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-muted/20 px-4 py-3 sm:py-2.5"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center items-center gap-2 sm:gap-2.5"
          >
            <span class="text-xs font-medium text-muted-foreground shrink-0"
              >Siklus Kenaikan:</span
            >
            <div class="flex items-center gap-2 sm:gap-2.5">
              <Select v-model="sourceAcademicYearId">
                <SelectTrigger class="h-8 w-36 sm:w-40 text-xs bg-background">
                  <SelectValue placeholder="Tahun Asal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="y in academicYears"
                    :key="y.id"
                    :value="y.id"
                    class="text-xs"
                  >
                    {{ y.name }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <ArrowRight class="size-3.5 text-muted-foreground shrink-0" />

              <Select
                v-model="targetAcademicYearId"
                :disabled="!sourceAcademicYearId"
              >
                <SelectTrigger class="h-8 w-36 sm:w-40 text-xs bg-background">
                  <SelectValue placeholder="Tahun Tujuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="y in availableTargetYears"
                    :key="y.id"
                    :value="y.id"
                    class="text-xs"
                  >
                    {{ y.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            class="h-8 text-xs font-medium px-3 shrink-0 self-center sm:self-auto"
            @click="isChoosingYears = false"
          >
            <Check class="size-3.5 mr-1" />
            Selesai
          </Button>
        </div>

        <!-- Nowhere to put them: the year ahead is missing the classes they
             move into. Offered here because this is where it is noticed. -->
        <div
          v-if="!isLoadingRecommendations && studentsWithoutTarget.length > 0"
          class="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs dark:border-amber-900/60 dark:bg-amber-950/20"
        >
          <div class="flex items-start gap-3">
            <AlertCircle
              class="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
            />
            <p class="leading-relaxed">
              <strong>{{ studentsWithoutTarget.length }} siswa</strong> belum
              punya kelas tujuan —
              {{ derived.target?.name ?? 'tahun ajaran tujuan' }} belum punya
              kelas di tingkat yang mereka tuju. Salin kelas dari
              {{ derived.source?.name ?? 'tahun ini' }} untuk mengisinya.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            :disabled="isCopyingClassrooms"
            @click="copyClassroomsForward"
          >
            <Loader2
              v-if="isCopyingClassrooms"
              class="size-4 mr-2 animate-spin"
            />
            Salin Kelas
          </Button>
        </div>

        <!-- Excluded Cohort Notice -->
        <div
          v-if="!isLoadingRecommendations && excludedGraduatingCount > 0"
          class="rounded-lg border border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/20 p-3.5 flex items-start gap-3 text-xs"
        >
          <GraduationCap
            class="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
          />
          <div>
            <span class="font-semibold text-blue-900 dark:text-blue-200">
              {{ excludedGraduatingCount }} siswa tingkat akhir tidak termasuk
              dalam kenaikan kelas ini.
            </span>
            <span class="text-blue-800/80 dark:text-blue-300/80 ml-1">
              Kelulusan mereka dicatat terpisah lewat menu
              <RouterLink
                to="/academic/graduation"
                class="font-semibold underline underline-offset-2 hover:text-blue-950 dark:hover:text-blue-100"
              >
                Kelulusan</RouterLink
              >.
            </span>
          </div>
        </div>

        <!-- DataTable -->
        <PromotionStudentTable
          :recommendations="promotionRecommendations"
          :is-loading="isLoadingRecommendations"
          :target-classrooms="targetClassrooms"
          @update:decisions="onDecisionsUpdate"
          @update:filter-class="selectedClass = $event"
        />

        <!-- Card Footer: Execution Status & Action -->
        <div
          v-if="
            promotionRecommendations.length > 0 && !isLoadingRecommendations
          "
          class="-mx-6 -mb-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-6 py-4"
        >
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1.5">
              <div class="size-2.5 rounded-full bg-green-500" />
              <span class="text-muted-foreground">
                Naik Kelas:
                <strong class="text-foreground">{{
                  summaryStats.approved
                }}</strong>
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="size-2.5 rounded-full bg-amber-500" />
              <span class="text-muted-foreground">
                Tinggal Kelas:
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
            :disabled="!canExecute"
            @click="openConfirmDialog"
          >
            <Loader2
              v-if="isPromoting"
              class="size-4 mr-2 animate-spin"
            />
            Proses Kenaikan
          </Button>
        </div>
      </div>
    </Card>
  </div>

  <!-- Confirmation Dialog -->
  <Dialog v-model:open="showConfirmDialog">
    <DialogContent
      class="sm:max-w-3xl flex flex-col gap-0 p-0 overflow-hidden max-h-[90svh]"
    >
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle>Konfirmasi Kenaikan Kelas</DialogTitle>
      </DialogHeader>

      <div class="overflow-y-auto px-6 py-4 space-y-4">
        <!-- Loading state -->
        <div
          v-if="isPreviewing"
          class="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 class="size-4 animate-spin" />
          Memeriksa data yang akan diproses...
        </div>

        <template v-else>
          <!-- Summary chips -->
          <div class="flex flex-wrap gap-2">
            <div
              class="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400"
            >
              <CheckCircle2 class="size-3.5" />
              {{ promotionPreview?.promotedCount ?? summaryStats.approved }}
              Naik Kelas
            </div>
            <div
              class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
            >
              <XCircle class="size-3.5" />
              {{ promotionPreview?.repeatedCount ?? summaryStats.declined }}
              Tinggal Kelas
            </div>
            <div
              class="inline-flex items-center gap-1.5 rounded-full bg-muted border px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              Total:
              {{ promotionPreview?.totalStudents ?? summaryStats.total }} Siswa
            </div>
          </div>

          <!-- Student preview table -->
          <div
            class="overflow-x-auto rounded-xl border bg-background shadow-xs"
          >
            <Table class="min-w-[600px]">
              <TableHeader class="bg-muted/50">
                <TableRow>
                  <TableHead class="text-center text-xs font-semibold w-[100px]"
                    >NIS</TableHead
                  >
                  <TableHead class="text-xs font-semibold"
                    >Nama Siswa</TableHead
                  >
                  <TableHead class="text-center text-xs font-semibold w-[90px]"
                    >Kelas Asal</TableHead
                  >
                  <TableHead class="text-center text-xs font-semibold w-[170px]"
                    >Kelas Tujuan</TableHead
                  >
                  <TableHead class="text-center text-xs font-semibold w-[110px]"
                    >Status</TableHead
                  >
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="row in previewRows"
                  :key="row.studentId"
                  :class="{ 'bg-destructive/5': !row.approved }"
                  class="transition-colors"
                >
                  <TableCell class="text-center py-2 text-xs text-foreground">
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
                  <TableCell class="text-center py-2">
                    <Badge
                      variant="outline"
                      class="text-[11px] font-medium bg-background"
                    >
                      {{ row.sourceClass }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-center py-2">
                    <Badge
                      :variant="row.approved ? 'secondary' : 'destructive'"
                      class="text-[11px] font-medium"
                    >
                      {{ row.targetClass }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-center py-2">
                    <Badge
                      :variant="row.approved ? 'default' : 'destructive'"
                      class="text-[11px] shadow-none"
                    >
                      {{ row.approved ? 'Naik Kelas' : 'Tinggal Kelas' }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </template>
      </div>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex flex-row gap-2 justify-end"
      >
        <Button
          variant="outline"
          :disabled="isPromoting"
          @click="showConfirmDialog = false"
        >
          Batal
        </Button>
        <Button
          :disabled="isPromoting || isPreviewing"
          @click="handleExecute"
        >
          <Loader2
            v-if="isPromoting"
            class="size-4 mr-2 animate-spin"
          />
          Ya, Proses Sekarang
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Result Dialog -->
  <PromotionResultDialog
    v-model:open="showResultDialog"
    :result="promotionResult"
    @done="handleDone"
  />
</template>
