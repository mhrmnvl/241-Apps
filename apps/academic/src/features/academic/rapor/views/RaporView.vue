<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Search,
  Loader2,
  Eye,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Download,
} from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
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
import { useRapor } from '../composables/useRapor'
import { columns } from '../components/columns'
import RaporFormDialog from '../components/RaporFormDialog.vue'
import RaporDetailDialog from '../components/RaporDetailDialog.vue'
import type { RaporData } from '../types'
import { useRoleGuard } from '@/features/platform/auth'
import { toast } from 'vue-sonner'

const breadcrumbs = [
  { title: 'Manajemen Akademik', href: '#' },
  { title: 'Rapor Siswa', href: '/academic/report-card' },
]

const {
  rapors,
  loading,
  isGenerating,
  classrooms,
  semesters,
  selectedClassroomId,
  selectedSemesterId,
  fetchFilterOptions,
  fetchRapors,
  bulkGenerateRapor,
  togglePublish,
  exportReportCard,
} = useRapor()

const openForm = ref(false)
const openDetail = ref(false)
const editingData = ref<RaporData | null>(null)
const detailData = ref<RaporData | null>(null)
const hasDisplayedData = ref(false)
const showBulkConfirm = ref(false)
const { can } = useRoleGuard()

const isFilterReady = computed(
  () => Boolean(selectedClassroomId.value) && Boolean(selectedSemesterId.value),
)

const activeSemesters = computed(() => {
  return semesters.value.map((sem) => ({
    id: sem.id,
    name: `${sem.academicYear?.name ?? ''} - ${sem.type.name}`,
  }))
})

const raporSemesterOptions = computed<ComboboxOption[]>(() =>
  activeSemesters.value.map((s) => ({ value: s.id, label: s.name })),
)
const raporClassroomOptions = computed<ComboboxOption[]>(() =>
  classrooms.value.map((c) => ({
    value: c.id,
    label: c.code ?? c.displayName,
  })),
)

const stats = computed(() => {
  const total = rapors.value.length
  const published = rapors.value.filter((r) => r.isPublished).length
  const draft = total - published
  const avgAll =
    total > 0
      ? rapors.value.reduce((sum, r) => sum + (r.totalAverage ?? 0), 0) / total
      : 0
  return { total, published, draft, avgAll }
})

const tableColumns = [
  ...columns,
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }: { row: { original: RaporData } }) => {
      const rapor = row.original
      return [
        {
          label: 'Lihat Detail',
          icon: Eye,
          onClick: () => {
            detailData.value = rapor
            openDetail.value = true
          },
        },
        ...(can('report-cards.update') || can('report-cards.delete')
          ? [
              {
                label: 'Edit',
                icon: Pencil,
                onClick: () => {
                  editingData.value = rapor
                  openForm.value = true
                },
              },
              {
                label: rapor.isPublished ? 'Unpublish' : 'Publish',
                icon: rapor.isPublished ? ToggleLeft : ToggleRight,
                onClick: () => {
                  if (!rapor.isPublished && rapor.totalAverage === null) {
                    toast.error(
                      'Rapor belum bisa dipublish karena nilai belum digenerate.',
                    )
                    return
                  }
                  void togglePublish(rapor.id, rapor.isPublished)
                },
              },
            ]
          : []),
        ...(rapor.isPublished
          ? [
              {
                label: 'Export PDF',
                icon: Download,
                onClick: () => {
                  const studentName =
                    rapor.enrollment?.student?.user?.profile?.name ?? 'Siswa'
                  void exportReportCard(rapor.id, studentName)
                },
              },
            ]
          : []),
      ]
    },
  },
]

async function handleFilter() {
  if (!isFilterReady.value) return
  hasDisplayedData.value = true
  await fetchRapors()
}

async function handleGenerateBulk() {
  showBulkConfirm.value = false
  await bulkGenerateRapor()
}

watch(openForm, (isOpen) => {
  if (!isOpen) editingData.value = null
})

watch(openDetail, (isOpen) => {
  if (!isOpen) detailData.value = null
})

watch([selectedClassroomId, selectedSemesterId], () => {
  hasDisplayedData.value = false
})

onMounted(async () => {
  await fetchFilterOptions()
  const activeSemester = semesters.value.find(
    (s) => s.type?.name === 'ODD' || s.type?.name === 'EVEN',
  )
  if (!selectedSemesterId.value && activeSemester) {
    selectedSemesterId.value = activeSemester.id
  }
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
            <CardTitle class="text-2xl font-bold tracking-tight"
              >Rapor Siswa</CardTitle
            >
          </div>
        </CardHeader>

        <div class="space-y-6 p-6">
          <div class="rounded-lg border bg-muted/20 p-4">
            <div class="flex flex-col sm:flex-row gap-4 items-end">
              <div class="space-y-2 flex-1 max-w-[250px]">
                <Label>Tahun Ajaran & Semester</Label>
                <AppCombobox
                  v-model="selectedSemesterId"
                  :options="raporSemesterOptions"
                  placeholder="Pilih Semester"
                  search-placeholder="Cari semester..."
                  empty-text="Semester tidak ditemukan."
                />
              </div>

              <div class="space-y-2 flex-1 max-w-[250px]">
                <Label>Kelas</Label>
                <AppCombobox
                  v-model="selectedClassroomId"
                  :options="raporClassroomOptions"
                  placeholder="Pilih Kelas"
                  search-placeholder="Cari kelas..."
                  empty-text="Kelas tidak ditemukan."
                />
              </div>

              <Button
                :disabled="!isFilterReady || loading"
                class="w-full sm:w-auto"
                @click="handleFilter"
              >
                <Search class="mr-2 h-4 w-4" /> Tampilkan
              </Button>

              <div class="flex-1"></div>

              <Button
                v-if="
                  hasDisplayedData &&
                  (can('report-cards.create') || can('report-cards.update'))
                "
                variant="outline"
                :disabled="!isFilterReady || isGenerating"
                class="w-full sm:w-auto"
                @click="showBulkConfirm = true"
              >
                <Loader2
                  v-if="isGenerating"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                Generate Rapor Massal
              </Button>
            </div>
          </div>

          <div
            v-if="hasDisplayedData && stats.total > 0"
            class="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div class="rounded-lg border p-4 text-center">
              <p class="text-2xl font-bold">{{ stats.total }}</p>
              <p class="text-xs text-muted-foreground">Total Siswa</p>
            </div>
            <div class="rounded-lg border p-4 text-center">
              <p class="text-2xl font-bold text-green-600">
                {{ stats.published }}
              </p>
              <p class="text-xs text-muted-foreground">Published</p>
            </div>
            <div class="rounded-lg border p-4 text-center">
              <p class="text-2xl font-bold text-yellow-600">
                {{ stats.draft }}
              </p>
              <p class="text-xs text-muted-foreground">Draft</p>
            </div>
            <div class="rounded-lg border p-4 text-center">
              <p class="text-2xl font-bold">
                {{ stats.avgAll > 0 ? stats.avgAll.toFixed(2) : '-' }}
              </p>
              <p class="text-xs text-muted-foreground">Rata-rata Kelas</p>
            </div>
          </div>

          <DataTable
            v-if="hasDisplayedData"
            :columns="tableColumns"
            :data="rapors"
            :loading="loading"
            search-key="name"
            search-placeholder="Cari nama siswa..."
          />

          <div
            v-else-if="!loading"
            class="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-muted/30"
          >
            <h3 class="mt-4 text-lg font-semibold">Belum Ada Data</h3>
            <p class="text-sm text-muted-foreground">
              Pilih semester dan kelas, lalu klik Tampilkan untuk melihat data
              rapor.
            </p>
          </div>
        </div>
      </Card>
    </div>

    <RaporFormDialog
      v-if="can('report-cards.create')"
      v-model:open="openForm"
      :rapor="editingData"
    />

    <RaporDetailDialog
      v-model:open="openDetail"
      :rapor="detailData"
    />

    <AlertDialog
      :open="showBulkConfirm"
      @update:open="showBulkConfirm = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Generate Rapor Massal?</AlertDialogTitle>
          <AlertDialogDescription>
            Rapor akan di-generate untuk semua siswa di kelas ini. Nilai
            rata-rata dan peringkat akan dihitung otomatis berdasarkan data
            nilai yang sudah ada. Rapor yang sudah ada akan diperbarui.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction @click="handleGenerateBulk"
            >Ya, Generate</AlertDialogAction
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </AppLayout>
</template>
