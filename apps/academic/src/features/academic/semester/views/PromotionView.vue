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
  PromotionStepSelect,
  PromotionStepExecuting,
} from '../components'
import { useSemesterList } from '../composables/useSemesterList'
import { useSemesterPromotion } from '../composables/useSemesterPromotion'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
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
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Semester', href: '/academic/semester' },
  { title: 'Kenaikan Kelas', href: '/academic/semester/promotion' },
]

const router = useRouter()

const { semesters, fetchSemesters } = useSemesterList()
const {
  isPromoting,
  isLoadingRecommendations,
  promotionRecommendations,
  fetchPromotionRecommendation,
  executePromotion,
} = useSemesterPromotion()

const currentStep = ref(0)
const sourceSemesterId = ref('')
const targetSemesterId = ref('')
const studentDecisions = ref<PromotionStudentDecision[]>([])
const showConfirmDialog = ref(false)
const showResultDialog = ref(false)
const promotionResult = ref<PromotionResult | null>(null)

const steps = [
  { title: 'Pilih Semester', description: 'Pilih semester asal dan tujuan' },
  { title: 'Review Siswa', description: 'Setujui atau tolak per siswa' },
  { title: 'Preview', description: 'Tinjau ringkasan keputusan' },
  { title: 'Eksekusi', description: 'Proses kenaikan kelas' },
]

const canProceedStep0 = computed(
  () => !!sourceSemesterId.value && !!targetSemesterId.value,
)

const canProceedStep1 = computed(() => {
  if (studentDecisions.value.length === 0) return false
  return studentDecisions.value.every((d) => {
    if (!d.approved && !d.declineReason) return false
    if (d.action !== 'GRADUATE' && !d.targetClassroomId) return false
    return true
  })
})

function buildPayload(): PromotionPayload {
  const students: PromotionStudentPayload[] = studentDecisions.value.map(
    (d) => ({
      studentId: d.studentId,
      sourceClassroomId: d.sourceClassroomId,
      targetClassroomId:
        d.action === 'GRADUATE' ? undefined : d.targetClassroomId,
      action: d.approved ? d.action : 'REPEAT',
      declineReason: d.approved ? undefined : d.declineReason,
    }),
  )

  return {
    sourceSemesterId: sourceSemesterId.value,
    targetSemesterId: targetSemesterId.value,
    students,
  }
}

async function handleNext() {
  if (currentStep.value === 0) {
    await fetchPromotionRecommendation({
      sourceSemesterId: sourceSemesterId.value,
      targetSemesterId: targetSemesterId.value,
    })
    currentStep.value = 1
  } else if (currentStep.value === 1) {
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    showConfirmDialog.value = true
  }
}

function handleBack() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function handleExecute() {
  showConfirmDialog.value = false
  currentStep.value = 3
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

watch(sourceSemesterId, () => {
  if (sourceSemesterId.value === targetSemesterId.value) {
    targetSemesterId.value = ''
  }
})

onMounted(() => {
  void fetchSemesters()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader class="border-b px-6 py-5">
          <CardTitle class="text-2xl font-bold tracking-tight">
            Kenaikan Kelas
          </CardTitle>
        </CardHeader>

        <div class="p-0">
          <div class="bg-muted/30 border-b px-6 py-4">
            <div class="flex items-center justify-between max-w-3xl mx-auto">
              <div
                v-for="(step, idx) in steps"
                :key="idx"
                class="flex items-center"
                :class="idx < steps.length - 1 ? 'flex-1' : ''"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300"
                    :class="[
                      idx < currentStep
                        ? 'bg-primary/20 text-primary'
                        : idx === currentStep
                          ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/10'
                          : 'bg-muted text-muted-foreground',
                    ]"
                  >
                    <CheckCircle2
                      v-if="idx < currentStep"
                      class="h-5 w-5"
                    />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <div class="hidden md:block">
                    <p
                      class="text-sm font-semibold transition-colors duration-300"
                      :class="
                        idx <= currentStep
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      "
                    >
                      {{ step.title }}
                    </p>
                    <p class="text-xs text-muted-foreground hidden lg:block">
                      {{ step.description }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="idx < steps.length - 1"
                  class="mx-4 h-[2px] flex-1 rounded-full transition-colors duration-300"
                  :class="idx < currentStep ? 'bg-primary' : 'bg-border'"
                />
              </div>
            </div>
          </div>

          <div class="p-6 sm:p-8 md:p-10">
            <PromotionStepSelect
              v-if="currentStep === 0"
              v-model:source-semester-id="sourceSemesterId"
              v-model:target-semester-id="targetSemesterId"
              :semesters="semesters"
            />

            <div
              v-if="currentStep === 1"
              class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6"
            >
              <div class="space-y-1 mb-6">
                <h2 class="text-xl font-bold tracking-tight">
                  Review & Keputusan Per Siswa
                </h2>
                <p class="text-muted-foreground text-sm">
                  Sistem telah memberikan rekomendasi otomatis. Anda dapat
                  menyetujui atau menolak kenaikan kelas untuk setiap siswa.
                  Siswa yang ditolak wajib diberikan alasan.
                </p>
              </div>

              <div
                class="rounded-xl border shadow-sm overflow-hidden bg-background"
              >
                <div
                  v-if="isLoadingRecommendations"
                  class="flex flex-col items-center justify-center py-20"
                >
                  <Loader2 class="h-8 w-8 animate-spin text-primary mb-4" />
                  <span class="text-muted-foreground font-medium"
                    >Menganalisis data siswa...</span
                  >
                </div>
                <PromotionStudentTable
                  v-else
                  :recommendations="promotionRecommendations"
                  @update:decisions="onDecisionsUpdate"
                />
              </div>
            </div>

            <div
              v-if="currentStep === 2"
              class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6"
            >
              <div class="space-y-1 mb-6">
                <h2 class="text-xl font-bold tracking-tight">Tinjauan Akhir</h2>
                <p class="text-muted-foreground text-sm">
                  Periksa kembali ringkasan keputusan kenaikan kelas sebelum
                  memproses. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div
                class="rounded-xl border shadow-sm overflow-hidden bg-background p-6"
              >
                <PromotionPreviewTable
                  :decisions="studentDecisions"
                  :recommendations="promotionRecommendations"
                />
              </div>
            </div>

            <PromotionStepExecuting v-if="currentStep === 3" />

            <div
              v-if="currentStep < 3"
              class="flex items-center justify-between mt-8 pt-6 border-t"
            >
              <Button
                v-if="currentStep > 0"
                variant="outline"
                size="lg"
                class="font-semibold"
                @click="handleBack"
              >
                <ArrowLeft class="size-4 mr-2" />
                Kembali
              </Button>
              <div v-else />

              <Button
                size="lg"
                class="font-semibold px-8"
                :disabled="
                  (currentStep === 0 && !canProceedStep0) ||
                  (currentStep === 1 && !canProceedStep1) ||
                  isPromoting ||
                  isLoadingRecommendations
                "
                @click="handleNext"
              >
                <Loader2
                  v-if="isPromoting || isLoadingRecommendations"
                  class="size-4 mr-2 animate-spin"
                />
                {{ currentStep === 2 ? 'Proses Kenaikan' : 'Selanjutnya' }}
                <ArrowRight
                  v-if="
                    currentStep < 2 && !isPromoting && !isLoadingRecommendations
                  "
                  class="size-4 ml-2"
                />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <AlertDialog v-model:open="showConfirmDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Proses Kenaikan Kelas?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan memproses keputusan kenaikan kelas untuk semua
            siswa yang telah direview. Proses ini tidak dapat dibatalkan.
            Pastikan semua keputusan sudah benar sebelum melanjutkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isPromoting"> Batal </AlertDialogCancel>
          <AlertDialogAction
            :disabled="isPromoting"
            @click="handleExecute"
          >
            Ya, Proses Sekarang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <PromotionResultDialog
      v-model:open="showResultDialog"
      :result="promotionResult"
      @done="handleDone"
    />
  </AppLayout>
</template>
