<script setup lang="ts">
import type {
  PromotionPayload,
  PromotionResult,
  PromotionStudentDecision,
  PromotionStudentPayload,
} from '../types'
import {
  PromotionPreviewTable,
  PromotionResultDialog,
  PromotionStudentTable,
} from '../components'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
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
  Sparkles,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useSemesterList } from '../composables/useSemesterList'
import { useSemesterPromotion } from '../composables/useSemesterPromotion'

const router = useRouter()

const { academicYears, fetchAcademicYears } = useSemesterList()
const {
  isPromoting,
  isLoadingRecommendations,
  promotionRecommendations,
  excludedGraduatingCount,
  fetchPromotionRecommendation,
  executePromotion,
} = useSemesterPromotion()

// Academic years, not semesters. Kenaikan kelas moves a student between years;
// moving between the terms of one year is a rollover and has its own screen.
// Which term of each year is read and written is the server's call — see
// `PromotionSemesterResolver` — so this screen cannot pair two terms of the
// same year, which it used to be able to do in two clicks.
const sourceAcademicYearId = ref('')
const targetAcademicYearId = ref('')
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

onMounted(() => {
  void fetchAcademicYears()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 py-0 gap-0"
    >
      <!-- Main Card Header -->
      <CardHeader
        class="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Kenaikan Kelas
        </CardTitle>

        <div class="flex w-full items-center justify-end gap-2 sm:w-auto">
          <Button
            :disabled="!canExecute"
            @click="showConfirmDialog = true"
          >
            <Loader2
              v-if="isPromoting"
              class="size-4 mr-2 animate-spin"
            />
            <CheckCircle2
              v-else
              class="size-4 mr-2"
            />
            Proses Kenaikan Kelas
            <span
              v-if="summaryStats.total > 0"
              class="ml-1.5 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-semibold"
            >
              {{ summaryStats.total }}
            </span>
          </Button>
        </div>
      </CardHeader>

      <!-- Main Card Body -->
      <div class="p-6 space-y-6">
        <!-- Top Semester Selection Card -->
        <Card class="rounded-xl shadow-xs py-0 gap-0">
          <CardHeader
            class="flex flex-row items-center justify-between border-b px-5 py-3.5 pb-3.5!"
          >
            <div class="flex items-center gap-2">
              <GraduationCap class="size-4 text-primary shrink-0" />
              <CardTitle class="text-sm font-semibold tracking-normal">
                Pilih Siklus Tahun Ajaran
              </CardTitle>
            </div>
            <span class="text-xs text-muted-foreground hidden sm:inline">
              Tentukan tahun ajaran asal siswa dan tahun ajaran tujuan kenaikan
            </span>
          </CardHeader>

          <CardContent class="p-5">
            <div
              class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4"
            >
              <!-- Tahun Ajaran Asal -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-muted-foreground">
                  Tahun Ajaran Asal (Posisi Siswa Saat Ini)
                </label>
                <Select v-model="sourceAcademicYearId">
                  <SelectTrigger class="h-10 text-sm bg-background">
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

              <!-- Divider Icon -->
              <div class="hidden md:flex items-center justify-center pt-5">
                <div
                  class="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
                >
                  <ArrowRight class="size-4" />
                </div>
              </div>

              <!-- Tahun Ajaran Tujuan -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-muted-foreground">
                  Tahun Ajaran Tujuan (Tujuan Kenaikan Kelas)
                </label>
                <Select
                  v-model="targetAcademicYearId"
                  :disabled="!sourceAcademicYearId"
                >
                  <SelectTrigger class="h-10 text-sm bg-background">
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

            <!-- Excluded Cohort Notice -->
            <div
              v-if="!isLoadingRecommendations && excludedGraduatingCount > 0"
              class="mt-4 rounded-lg border border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/20 p-3.5 flex items-start gap-3 text-xs"
            >
              <GraduationCap
                class="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
              />
              <div>
                <span class="font-semibold text-blue-900 dark:text-blue-200">
                  {{ excludedGraduatingCount }} siswa tingkat akhir tidak
                  termasuk dalam kenaikan kelas ini.
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
          </CardContent>
        </Card>

        <!-- Main Content State: Unselected / Loading / Empty / 2-DataTable View -->
        <div v-if="!sourceAcademicYearId || !targetAcademicYearId">
          <Card class="rounded-xl border-dashed py-16 text-center shadow-none">
            <div
              class="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto"
            >
              <div
                class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                <Sparkles class="size-6" />
              </div>
              <h3 class="text-base font-semibold text-foreground">
                Pilih Semester Asal & Tujuan
              </h3>
              <p class="text-xs text-muted-foreground leading-relaxed">
                Silakan pilih semester asal dan tujuan di atas untuk memulai
                analisis dan menyusun kenaikan kelas siswa secara otomatis.
              </p>
            </div>
          </Card>
        </div>

        <!-- Loading State -->
        <div
          v-else-if="isLoadingRecommendations"
          class="py-20 text-center flex flex-col items-center justify-center gap-3"
        >
          <Loader2 class="size-8 animate-spin text-primary" />
          <p class="text-sm font-medium text-foreground">
            Menganalisis data siswa...
          </p>
          <p class="text-xs text-muted-foreground">
            Menghitung nilai rata-rata dan rekomendasi kelas tujuan.
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="promotionRecommendations.length === 0"
          class="py-16 text-center"
        >
          <Card
            class="rounded-xl border-dashed p-10 max-w-md mx-auto shadow-none"
          >
            <GraduationCap
              class="size-8 mx-auto text-muted-foreground mb-3 opacity-60"
            />
            <h3 class="text-base font-semibold text-foreground">
              Tidak Ada Data Siswa
            </h3>
            <p class="text-xs text-muted-foreground mt-1">
              Tidak ada siswa aktif yang ditemukan pada semester asal yang
              dipilih.
            </p>
          </Card>
        </div>

        <!-- 2 DataTables Side-by-Side -->
        <div
          v-else
          class="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start animate-in fade-in duration-300"
        >
          <!-- Left Panel: Siswa Asal & Keputusan -->
          <Card class="rounded-xl shadow-xs py-0 gap-0">
            <CardContent class="p-5">
              <PromotionStudentTable
                :recommendations="promotionRecommendations"
                @update:decisions="onDecisionsUpdate"
              />
            </CardContent>
          </Card>

          <!-- Right Panel: Kelas Tujuan & Preview -->
          <Card class="rounded-xl shadow-xs py-0 gap-0">
            <CardContent class="p-5">
              <PromotionPreviewTable
                :decisions="studentDecisions"
                :recommendations="promotionRecommendations"
              />
            </CardContent>
          </Card>
        </div>

        <!-- Bottom Actions / Execution Status -->
        <div
          v-if="
            sourceAcademicYearId &&
            targetAcademicYearId &&
            promotionRecommendations.length > 0 &&
            !isLoadingRecommendations
          "
          class="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-xs"
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
            @click="showConfirmDialog = true"
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
      </div>
    </Card>
  </div>

  <!-- Confirmation Dialog -->
  <AlertDialog v-model:open="showConfirmDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Proses Kenaikan Kelas?</AlertDialogTitle>
        <AlertDialogDescription>
          Tindakan ini akan memproses data kenaikan kelas untuk
          <strong>{{ summaryStats.total }} siswa</strong> ({{
            summaryStats.approved
          }}
          naik kelas, {{ summaryStats.declined }} tinggal kelas). Siswa akan
          langsung didaftarkan ke kelas tujuan pada semester target.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isPromoting"> Batal </AlertDialogCancel>
        <AlertDialogAction
          :disabled="isPromoting"
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
