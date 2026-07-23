<script setup lang="ts">
import StudentScoreInputTable from '../components/StudentScoreInputTable.vue'
import { useStudentScore } from '../composables/useStudentScore'
import AppLayout from '@/layouts/AppLayout.vue'
import { Alert, AlertDescription } from '@/ui/alert'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/ui/card'
import { useRoleGuard } from '@/features/platform/auth'
import { AlertCircle, ArrowLeft } from 'lucide-vue-next'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const TYPE_LABELS: Record<string, string> = {
  DAILY: 'Harian',
  ASSIGNMENT: 'Tugas',
  PRACTICAL: 'Praktikum',
  MIDTERM: 'UTS',
  FINAL: 'UAS',
}

const route = useRoute()
const router = useRouter()
const { can } = useRoleGuard()
const canManage = computed(() => can('student-scores.manage'))

const assessmentItemId = computed(() => String(route.params.assessmentItemId))

const {
  assessmentItem,
  roster,
  loading,
  isSaving,
  formError,
  fetchRoster,
  saveRoster,
} = useStudentScore()

const breadcrumbs = computed(() => [
  { title: 'Penilaian', href: '#' },
  { title: 'Tugas & Nilai', href: '/academic/student-score' },
  { title: assessmentItem.value?.name ?? 'Nilai', href: route.path },
])

async function handleSave() {
  const result = await saveRoster(assessmentItemId.value, roster.value)
  if (result.success) {
    toast.success('Nilai siswa berhasil disimpan.')
  }
}

onMounted(() => {
  void fetchRoster(assessmentItemId.value)
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col items-start justify-between gap-2 border-b px-6 py-5 sm:flex-row sm:items-center"
        >
          <div>
            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                class="size-8"
                @click="router.push('/academic/student-score')"
              >
                <ArrowLeft class="size-4" />
              </Button>
              <CardTitle class="text-2xl font-bold tracking-tight">
                {{ assessmentItem?.name ?? 'Nilai Siswa' }}
              </CardTitle>
            </div>
            <CardDescription
              v-if="assessmentItem"
              class="mt-1 ml-10"
            >
              {{ TYPE_LABELS[assessmentItem.type] ?? assessmentItem.type }} ·
              Bobot {{ assessmentItem.weight }}% · Skor Maks
              {{ assessmentItem.maxScore }}
            </CardDescription>
          </div>
        </CardHeader>

        <div class="space-y-4 p-6">
          <Alert
            v-if="formError"
            variant="destructive"
          >
            <AlertCircle class="size-4" />
            <AlertDescription>{{ formError }}</AlertDescription>
          </Alert>

          <StudentScoreInputTable
            v-model:rows="roster"
            :loading="loading"
            :is-saving="isSaving"
            :max-score="assessmentItem?.maxScore ?? 100"
            :can-save="canManage"
            @save="handleSave"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
