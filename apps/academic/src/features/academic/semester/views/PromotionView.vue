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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Loader2,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useSemesterList } from '../composables/useSemesterList'
import { useSemesterPromotion } from '../composables/useSemesterPromotion'
import { derivePromotionYears } from '../logic/derivePromotionYears'

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
const studentDecisions = ref<PromotionStudentDecision[]>([])
const showConfirmDialog = ref(false)
const showResultDialog = ref(false)
const promotionResult = ref<PromotionResult | null>(null)

const availableTargetYears = computed(() =>
  academicYears.value.filter((y) => y.id !== sourceAcademicYearId.value),
)

const canExecute = computed(() => {
  if (!sourceAcademicYearId.value || !targetAcademicYearId.value) return false
  if (isLoadingRecommendations.value || isPromoting.value) return false
  if (promotionRecommendations.value.length === 0) return false
  if (studentDecisions.value.length === 0) return false

  return studentDecisions.value.every((d) => {
    if (!d.approved && !d.declineReason) return false
    // Every decision needs a classroom, including a student held back — they
    // still enrol somewhere, in the grade they were already in. The server
    // refuses a decision without one, so catching it here keeps the button
    // from promising a run that would be rejected on arrival.
    if (!d.targetClassroomId) return false
    return true
  })
})

const summaryStats = computed(() => {
  let approved = 0
  let declined = 0
  for (const d of studentDecisions.value) {
    if (d.approved) approved++
    else declined++
  }
  return { approved, declined, total: studentDecisions.value.length }
})

function buildPayload(): PromotionPayload {
  const students: PromotionStudentPayload[] = studentDecisions.value
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

watch(sourceAcademicYearId, () => {
  if (sourceAcademicYearId.value === targetAcademicYearId.value) {
    targetAcademicYearId.value = ''
  }
})

watch(
  [sourceAcademicYearId, targetAcademicYearId],
  async ([source, target]) => {
    if (source && target) {
      await fetchPromotionRecommendation({
        sourceAcademicYearId: source,
        targetAcademicYearId: target,
      })
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
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 py-0 gap-0"
    >
      <!-- Main Card Header -->
      <CardHeader class="border-b px-6 py-5">
        <CardTitle class="text-2xl font-bold tracking-tight">
          Kenaikan Kelas
        </CardTitle>
      </CardHeader>

      <!-- Main Card Body -->
      <div class="px-6 pb-6 pt-8 space-y-4">
        <!-- Stated, not asked. The pair is derived; the selects are the way
             back for a school that ran a year late. -->
        <div
          v-if="!isChoosingYears"
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3"
        >
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span class="text-muted-foreground">Menaikkan siswa dari</span>
            <span class="font-semibold">
              {{ derived.source?.name ?? 'tahun ajaran aktif' }}
            </span>
            <ArrowRight class="size-4 text-muted-foreground" />
            <span
              v-if="derived.target"
              class="font-semibold"
            >
              {{ derived.target.name }}
            </span>
            <span
              v-else
              class="font-medium text-destructive"
            >
              tahun ajaran berikutnya belum dibuat
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground"
            @click="isChoosingYears = true"
          >
            Ubah
          </Button>
        </div>

        <div
          v-else
          class="space-y-3 rounded-lg border bg-muted/30 px-4 py-3"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs text-muted-foreground">
              Biasanya tidak perlu diubah. Gunakan ini bila kenaikan kelas tahun
              sebelumnya terlewat.
            </p>
            <Button
              variant="ghost"
              size="sm"
              class="text-muted-foreground"
              @click="isChoosingYears = false"
            >
              Selesai
            </Button>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-4"
          >
            <div class="grid gap-2">
              <Label>Tahun Ajaran Asal</Label>
              <Select v-model="sourceAcademicYearId">
                <SelectTrigger class="bg-background">
                  <SelectValue placeholder="Pilih tahun ajaran asal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="y in academicYears"
                    :key="y.id"
                    :value="y.id"
                  >
                    <div class="flex items-center gap-2">
                      <span>{{ y.name }}</span>
                      <Badge
                        v-if="y.isActive"
                        variant="default"
                        class="text-[10px] px-1.5 py-0"
                      >
                        Aktif
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="hidden md:flex items-center justify-center pb-0.5">
              <ArrowRight class="size-4 text-muted-foreground" />
            </div>

            <div class="grid gap-2">
              <Label>Tahun Ajaran Tujuan</Label>
              <Select
                v-model="targetAcademicYearId"
                :disabled="!sourceAcademicYearId"
              >
                <SelectTrigger class="bg-background">
                  <SelectValue placeholder="Pilih tahun ajaran tujuan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="y in availableTargetYears"
                    :key="y.id"
                    :value="y.id"
                  >
                    <div class="flex items-center gap-2">
                      <span>{{ y.name }}</span>
                      <Badge
                        v-if="y.isActive"
                        variant="default"
                        class="text-[10px] px-1.5 py-0"
                      >
                        Aktif
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                to="/student/alumni"
                class="font-semibold underline underline-offset-2 hover:text-blue-950 dark:hover:text-blue-100"
              >
                Kelulusan &amp; Alumni </RouterLink
              >.
            </span>
          </div>
        </div>

        <!-- DataTable -->
        <PromotionStudentTable
          :recommendations="promotionRecommendations"
          :is-loading="isLoadingRecommendations"
          @update:decisions="onDecisionsUpdate"
        />
      </div>

      <!-- Card Footer: Execution Status & Action -->
      <div
        v-if="promotionRecommendations.length > 0 && !isLoadingRecommendations"
        class="flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-6 py-4"
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
          <CheckCircle2
            v-else
            class="size-4 mr-2"
          />
          Eksekusi Kenaikan Kelas ({{ summaryStats.total }})
        </Button>
      </div>
    </Card>
  </div>

  <!-- Confirmation Dialog -->
  <AlertDialog v-model:open="showConfirmDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Proses Kenaikan Kelas?</AlertDialogTitle>
        <AlertDialogDescription>
          <span
            v-if="isPreviewing"
            class="flex items-center gap-2"
          >
            <Loader2 class="size-4 animate-spin" />
            Memeriksa data yang akan diproses...
          </span>
          <template v-else>
            Tindakan ini akan memproses data kenaikan kelas untuk
            <strong>
              {{ promotionPreview?.totalStudents ?? summaryStats.total }} siswa
            </strong>
            ({{ promotionPreview?.promotedCount ?? summaryStats.approved }} naik
            kelas,
            {{ promotionPreview?.repeatedCount ?? summaryStats.declined }}
            tinggal kelas). Siswa akan langsung didaftarkan ke kelas tujuan pada
            tahun ajaran target.
          </template>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isPromoting"> Batal </AlertDialogCancel>
        <AlertDialogAction
          :disabled="isPromoting || isPreviewing"
          @click="handleExecute"
        >
          <Loader2
            v-if="isPromoting"
            class="size-4 mr-2 animate-spin"
          />
          Ya, Proses Sekarang
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- Result Dialog -->
  <PromotionResultDialog
    v-model:open="showResultDialog"
    :result="promotionResult"
    @done="handleDone"
  />
</template>
