<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { watchDebounced } from '@vueuse/core'
import { ArrowLeftRight, Plus, Search } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { createColumns } from '../components/columns'
import TeacherFormDialog from '../components/TeacherFormDialog.vue'
import ImportExportTeacherDialog from '../components/ImportExportTeacherDialog.vue'
import { useTeacher } from '../composables/useTeacher'
import { useTeacherImportExport } from '../composables/useTeacherImportExport'
import type {
  Teacher,
  TeacherSavePayload,
  TeacherUpdatePayload,
} from '../types'

const breadcrumbs = [{ title: 'Guru', href: '#' }, { title: 'Daftar Guru' }]
const router = useRouter()

const {
  positions,
  positionCategories,
  loading,
  filters,
  isSaving,
  formError,
  fetchTeachers,
  fetchPositions,
  fetchPositionCategories,
  saveTeacher,
  savePosition,
  deletePosition,
  deleteTeacher,
  filteredTeachers,
} = useTeacher()

const {
  isImportExportOpen,
  isImporting,
  downloadTemplate,
  exportData,
  handleFileUpload,
} = useTeacherImportExport({
  teachers: filteredTeachers,
  onImportSuccess: () => {
    void fetchTeachers()
  },
})

const isModalOpen = ref(false)
const editingItem = ref<Teacher | null>(null)
const { isAdmin } = useRoleGuard()

async function handleSaveTeacher(
  payload: TeacherSavePayload | TeacherUpdatePayload,
) {
  const result = await saveTeacher(editingItem.value?.id ?? null, payload)
  if (result.success) {
    toast.success(
      editingItem.value
        ? 'Data guru berhasil diperbarui'
        : 'Guru baru berhasil ditambahkan',
    )
    isModalOpen.value = false
    await fetchTeachers()
  }
}

async function handleSavePosition(
  teacherId: string,
  positionId: string,
  oldPositionLinkId: string | null,
) {
  if (oldPositionLinkId) {
    await deletePosition(teacherId, oldPositionLinkId)
  }
  const today = new Date().toISOString().substring(0, 10)
  const result = await savePosition(teacherId, {
    positionId,
    hireDate: today,
    isPrimary: true,
  })
  if (result.success) {
    toast.success('Jabatan guru berhasil diperbarui')
    await fetchTeachers()
  }
}

const tableColumns = createColumns({
  showActions: isAdmin.value,
  onViewDetail: (teacher) => {
    if (teacher?.user?.id) {
      void router.push(`/profile/TEACHER/${teacher.user.id}`)
    }
  },
  onEdit: (teacher) => {
    if (teacher?.id) {
      editingItem.value = teacher
      isModalOpen.value = true
    }
  },
  onDelete: async (teacher, { closeAlert, setLoading }) => {
    setLoading(true)
    try {
      await deleteTeacher(teacher.id)
      toast.success('Guru berhasil dihapus')
      await fetchTeachers()
      closeAlert()
    } catch (e: unknown) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal menghapus data guru'))
    } finally {
      setLoading(false)
    }
  },
})

watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

watchDebounced(
  () => filters.value.keyword,
  () => fetchTeachers(),
  { debounce: 400 },
)

onMounted(() => {
  void fetchTeachers()
  void fetchPositions()
  void fetchPositionCategories()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Daftar Guru
            </CardTitle>
          </div>
          <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button
              v-if="isAdmin"
              variant="outline"
              class="w-full sm:w-auto bg-white"
              @click="isImportExportOpen = true"
            >
              <ArrowLeftRight class="size-4 mr-2" />
              Import / Export
            </Button>
            <Button
              v-if="isAdmin"
              class="w-full sm:w-auto"
              @click="router.push('/teacher/create')"
            >
              <Plus class="size-4 mr-2" />
              Tambah Guru
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <Select
              :model-value="filters.categoryFilter"
              @update:model-value="
                filters.categoryFilter = ($event as string | null) ?? 'all'
              "
            >
              <SelectTrigger
                class="w-full lg:w-fit lg:min-w-[150px] px-3! gap-2!"
              >
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"> Semua Kategori </SelectItem>
                <SelectItem
                  v-for="cat in positionCategories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              :model-value="filters.positionFilter"
              @update:model-value="
                filters.positionFilter = ($event as string | null) ?? 'all'
              "
            >
              <SelectTrigger
                class="w-full lg:w-fit lg:min-w-[150px] px-3! gap-2!"
              >
                <SelectValue placeholder="Semua Jabatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"> Semua Jabatan </SelectItem>
                <SelectItem
                  v-for="pos in positions"
                  :key="pos.id"
                  :value="pos.id"
                >
                  {{ pos.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              :model-value="filters.statusFilter"
              @update:model-value="
                filters.statusFilter = ($event as string | null) ?? 'all'
              "
            >
              <SelectTrigger
                class="w-full lg:w-fit lg:min-w-[140px] px-3! gap-2!"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"> Semua Status </SelectItem>
                <SelectItem value="active"> Aktif </SelectItem>
                <SelectItem value="inactive"> Nonaktif </SelectItem>
              </SelectContent>
            </Select>

            <div class="relative lg:ml-auto lg:w-[240px]">
              <Search
                class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                v-model="filters.keyword"
                placeholder="Cari guru..."
                class="pl-9"
              />
            </div>
          </div>

          <div class="mt-0">
            <DataTable
              :columns="tableColumns"
              :data="filteredTeachers"
              :is-loading="loading"
              item-label="guru"
            />
          </div>
        </div>
      </Card>
    </div>

    <TeacherFormDialog
      v-if="isAdmin"
      v-model:open="isModalOpen"
      :form-error="formError"
      :is-saving="isSaving"
      :edit-data="editingItem"
      :positions="positions"
      @save="handleSaveTeacher"
      @save-position="handleSavePosition"
    />

    <ImportExportTeacherDialog
      v-if="isAdmin"
      v-model:open="isImportExportOpen"
      :is-processing="isImporting"
      @download-template="downloadTemplate"
      @export-data="exportData"
      @import-data="handleFileUpload"
    />
  </AppLayout>
</template>
