<script setup lang="ts">
import type { AcademicYear } from '../types'
import AcademicYearFormSheet from '../components/AcademicYearFormSheet.vue'
import { createAcademicYearColumns } from '../components/columns'
import { useAcademicYearList } from '../composables/useAcademicYearList'
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
import { Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'

const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Tahun Ajaran', href: '/akademik/tahun-ajaran' },
]

const {
  academicYears,
  totalItems,
  loading,
  fetchAcademicYears,
  deleteAcademicYear,
  activateAcademicYear,
  deactivateAcademicYear,
} = useAcademicYearList()

const isAddModalOpen = ref(false)
const editingItem = ref<AcademicYear | null>(null)
const { can } = useRoleGuard()

const confirmAction = ref<{
  type: 'activate' | 'deactivate'
  item: AcademicYear
} | null>(null)
const isProcessing = ref(false)

const tableColumns = createAcademicYearColumns({
  showActions: can('academic-years.update') || can('academic-years.delete'),
  canUpdate: can('academic-years.update'),
  canDelete: can('academic-years.delete'),
  onEdit: (academicYear: AcademicYear) => {
    editingItem.value = academicYear
    isAddModalOpen.value = true
  },
  onDelete: async (academicYear: AcademicYear, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteAcademicYear(academicYear.id)
    if (result.success) {
      await fetchAcademicYears()
      closeAlert()
    }
    setLoading(false)
  },
  onActivate: (academicYear: AcademicYear) => {
    confirmAction.value = { type: 'activate', item: academicYear }
  },
  onDeactivate: (academicYear: AcademicYear) => {
    confirmAction.value = { type: 'deactivate', item: academicYear }
  },
})

async function handleConfirmAction() {
  if (!confirmAction.value) return
  isProcessing.value = true
  const { type, item } = confirmAction.value
  const result =
    type === 'activate'
      ? await activateAcademicYear(item.id)
      : await deactivateAcademicYear(item.id)
  if (result.success) {
    await fetchAcademicYears()
  }
  isProcessing.value = false
  confirmAction.value = null
}

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
  }
})

onMounted(() => {
  void fetchAcademicYears()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Tahun Ajaran
          </CardTitle>
          <Button
            v-if="can('academic-years.create')"
            @click="isAddModalOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6 space-y-4">
          <DataTable
            :columns="tableColumns"
            :data="academicYears"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="tahun ajaran"
            filter-column="name"
            filter-placeholder="Cari tahun ajaran..."
          />

          <AcademicYearFormSheet
            v-if="can('academic-years.create') && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :edit-data="editingItem"
            @save-success="fetchAcademicYears"
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
                ? 'Aktifkan Tahun Ajaran?'
                : 'Nonaktifkan Tahun Ajaran?'
            }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{
              confirmAction?.type === 'activate'
                ? 'Mengaktifkan tahun ajaran ini akan menonaktifkan semua tahun ajaran lainnya. Lanjutkan?'
                : 'Apakah Anda yakin ingin menonaktifkan tahun ajaran ini?'
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
