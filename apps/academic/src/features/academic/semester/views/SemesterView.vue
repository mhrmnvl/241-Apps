<script setup lang="ts">
import type { RolloverSemesterPayload, Semester } from '../types'
import RolloverSemesterDialog from '../components/RolloverSemesterDialog.vue'
import SemesterFormSheet from '../components/SemesterFormSheet.vue'
import { createSemesterColumns } from '../components/columns'
import { useSemesterList } from '../composables/useSemesterList'
import { useSemesterRollover } from '../composables/useSemesterRollover'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
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
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { Copy, Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Semester', href: '/akademik/semester' },
]

const {
  semesters,
  totalSemesters,
  loading,
  academicYears,
  fetchSemesters,
  fetchAcademicYears,
  fetchSemesterTypes,
  deleteSemester,
  activateSemester,
  deactivateSemester,
} = useSemesterList()

const { isRollingOver, rolloverSummary, rolloverSemester } =
  useSemesterRollover()

const isAddModalOpen = ref(false)
const isRolloverModalOpen = ref(false)
const editingItem = ref<Semester | null>(null)
const { can } = useRoleGuard()

const confirmAction = ref<{
  type: 'activate' | 'deactivate'
  item: Semester
} | null>(null)
const isProcessing = ref(false)

const tableColumns = createSemesterColumns({
  showActions: can('semesters.update') || can('semesters.delete'),
  canUpdate: can('semesters.update'),
  canDelete: can('semesters.delete'),
  onEdit: (semester: Semester) => {
    editingItem.value = semester
    isAddModalOpen.value = true
  },
  onDelete: async (semester: Semester, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteSemester(semester.id)
    if (result.success) {
      await fetchSemesters()
      closeAlert()
    }
    setLoading(false)
  },
  onActivate: (semester: Semester) => {
    confirmAction.value = { type: 'activate', item: semester }
  },
  onDeactivate: (semester: Semester) => {
    confirmAction.value = { type: 'deactivate', item: semester }
  },
})

async function handleRollover(payload: RolloverSemesterPayload) {
  const result = await rolloverSemester(payload)
  if (result.success) {
    toast.success('Penyalinan data semester berhasil!')
    await fetchSemesters()
  }
}

async function handleConfirmAction() {
  if (!confirmAction.value) return
  isProcessing.value = true
  const { type, item } = confirmAction.value
  const result =
    type === 'activate'
      ? await activateSemester(item.id)
      : await deactivateSemester(item.id)
  if (result.success) {
    await fetchSemesters()
  }
  isProcessing.value = false
  confirmAction.value = null
}

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
  }
})

watch(isRolloverModalOpen, (isOpen) => {
  if (!isOpen) {
    rolloverSummary.value = null
  }
})

onMounted(() => {
  void fetchSemesters()
  void fetchAcademicYears()
  void fetchSemesterTypes()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Semester
          </CardTitle>
          <div
            v-if="can('semesters.create')"
            class="flex w-full items-center justify-end gap-2 sm:w-auto"
          >
            <Button
              variant="outline"
              @click="isRolloverModalOpen = true"
            >
              <Copy class="size-4 mr-2" />
              Salin Data
            </Button>
            <Button @click="isAddModalOpen = true">
              <Plus class="size-4 mr-2" />
              Tambah
            </Button>
          </div>
        </CardHeader>

        <div class="p-6 space-y-4">
          <DataTable
            :columns="tableColumns"
            :data="semesters"
            :total-items="totalSemesters"
            :is-loading="loading"
            item-label="semester"
            filter-column="type"
            filter-placeholder="Cari semester (Ganjil/Genap)..."
          />

          <SemesterFormSheet
            v-if="can('semesters.create') && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :academic-years="academicYears"
            :edit-data="editingItem"
            @save-success="fetchSemesters"
          />

          <RolloverSemesterDialog
            v-if="can('semesters.create')"
            v-model:open="isRolloverModalOpen"
            :semesters="semesters"
            :is-rolling-over="isRollingOver"
            :rollover-summary="rolloverSummary"
            @rollover="handleRollover"
          />
        </div>
      </Card>
    </div>

    <AlertDialog :open="!!confirmAction">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{
              confirmAction?.type === 'activate'
                ? 'Aktifkan Semester?'
                : 'Nonaktifkan Semester?'
            }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{
              confirmAction?.type === 'activate'
                ? 'Mengaktifkan semester ini akan menonaktifkan semua semester lainnya. Tahun ajaran terkait harus sudah aktif. Lanjutkan?'
                : 'Apakah Anda yakin ingin menonaktifkan semester ini?'
            }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            :disabled="isProcessing"
            @click="confirmAction = null"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            :disabled="isProcessing"
            @click="handleConfirmAction"
          >
            {{ isProcessing ? 'Memproses...' : 'Ya, Lanjutkan' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </AppLayout>
</template>
