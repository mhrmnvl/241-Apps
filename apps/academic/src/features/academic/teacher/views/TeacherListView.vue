<script setup lang="ts">
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
import { useRoleGuard } from '@/features/platform/auth'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { watchDebounced } from '@vueuse/core'
import { ArrowLeftRight, Plus, Search, Filter } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { createColumns } from '../components/columns'
import TeacherFormDialog from '../components/TeacherFormDialog.vue'
import { ImportPreviewDialog } from '@/features/academic/shared/import-preview'
import { teacherImportColumns } from '../importPreviewColumns'
import { ImportExportDialog } from '@/features/academic/shared/import-export'
import { teacherImportExportLabels } from '../importExportLabels'
import { useTeacher } from '../composables/useTeacher'
import { useTeacherImportExport } from '../composables/useTeacherImportExport'
import type {
  Teacher,
  TeacherSavePayload,
  TeacherUpdatePayload,
} from '../types'

const router = useRouter()

const {
  teachers,
  positionCategories,
  loading,
  filters,
  totalTeachers,
  currentPage,
  pageSize,
  isSaving,
  formError,
  fetchTeachers,
  fetchPositionCategories,
  saveTeacher,
  savePosition,
  deletePosition,
  deleteTeacher,
  setPage,
  setPageSize,
} = useTeacher()

const {
  isImportExportOpen,
  isImporting,
  isConflictDialogOpen,
  isResolvingConflicts,
  conflictRows,
  downloadTemplate,
  exportData,
  handleFileUpload,
  handleResolveConflicts,
} = useTeacherImportExport({
  teachers: teachers,
  onImportSuccess: () => {
    void fetchTeachers()
  },
})

const isModalOpen = ref(false)
const editingItem = ref<Teacher | null>(null)
const { can } = useRoleGuard()

// Applying an import creates the new rows and updates the conflicting ones, so
// the entry point asks for both — offering it on `create` alone would walk the
// user through the whole preview and refuse at the last click.
const canImport = computed(
  () => can('teachers.create') && can('teachers.update'),
)

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
  showActions: can('teachers.update') || can('teachers.delete'),
  canUpdate: can('teachers.update'),
  canDelete: can('teachers.delete'),
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

const isFilterDialogOpen = ref(false)

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.positionCategoryId) count++
  if (filters.value.statusFilter !== 'all') count++
  return count
})

function resetAllFilters() {
  filters.value.positionCategoryId = ''
  filters.value.statusFilter = 'all'
}

function handleFilterChange(
  key: 'positionCategoryId' | 'statusFilter',
  value: unknown,
) {
  if (key === 'positionCategoryId') {
    filters.value[key] =
      typeof value === 'string' && value !== 'all' ? value : ''
  } else {
    filters.value[key] = typeof value === 'string' ? value : 'all'
  }
}

watchDebounced(
  () => filters.value.keyword,
  () => {
    currentPage.value = 1
    void fetchTeachers()
  },
  { debounce: 400 },
)

watch(
  () => filters.value.positionCategoryId,
  () => {
    currentPage.value = 1
    void fetchTeachers()
  },
)

watch(
  () => filters.value.statusFilter,
  () => {
    currentPage.value = 1
    void fetchTeachers()
  },
)

onMounted(() => {
  void fetchTeachers()
  void fetchPositionCategories()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div>
          <CardTitle class="text-xl sm:text-2xl font-bold tracking-tight">
            Daftar Guru
          </CardTitle>
        </div>
        <div class="flex items-center gap-2">
          <!-- Desktop Action Buttons -->
          <div class="hidden sm:flex items-center gap-2">
            <Button
              v-if="canImport"
              variant="outline"
              size="sm"
              class="h-10 px-4 bg-white"
              @click="isImportExportOpen = true"
            >
              <ArrowLeftRight class="size-4 mr-2" />
              Import / Export
            </Button>
            <Button
              v-if="can('teachers.create')"
              size="sm"
              class="h-10 px-4"
              @click="router.push('/teacher/create')"
            >
              <Plus class="size-4 mr-2" />
              Tambah Guru
            </Button>
          </div>

          <!-- Mobile Action Dropdown -->
          <div
            v-if="can('teachers.create')"
            class="flex sm:hidden"
          >
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  size="sm"
                  class="h-9 px-3 gap-1"
                >
                  <Plus class="size-4" />
                  Tambah
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                class="w-48"
              >
                <DropdownMenuItem @click="router.push('/teacher/create')">
                  <Plus class="size-4 mr-2 text-muted-foreground" />
                  Tambah Guru
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="canImport"
                  @click="isImportExportOpen = true"
                >
                  <ArrowLeftRight class="size-4 mr-2 text-muted-foreground" />
                  Import / Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <div class="p-6">
        <!-- Filters Section matching Academic Layout -->
        <div class="mb-6">
          <!-- Desktop Layout: Inline selects -->
          <div class="hidden lg:flex lg:flex-row lg:items-center gap-3">
            <Select
              :model-value="filters.positionCategoryId || 'all'"
              @update:model-value="
                handleFilterChange('positionCategoryId', $event)
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
              :model-value="filters.statusFilter"
              @update:model-value="handleFilterChange('statusFilter', $event)"
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
          </div>

          <!-- Mobile Layout: Filter Dialog Button -->
          <div class="flex flex-col lg:hidden gap-3">
            <Button
              variant="outline"
              class="w-full relative justify-center"
              @click="isFilterDialogOpen = true"
            >
              <Filter class="size-4 mr-2" />
              Filter Guru
              <span
                v-if="activeFiltersCount > 0"
                class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
              >
                {{ activeFiltersCount }}
              </span>
            </Button>
          </div>
        </div>

        <div class="mt-0">
          <DataTable
            :columns="tableColumns"
            :data="teachers"
            :is-loading="loading"
            :total-items="totalTeachers"
            :page="currentPage"
            :page-size="pageSize"
            item-label="guru"
            @update:page="setPage"
            @update:page-size="setPageSize"
          >
            <template #header-right>
              <div class="relative w-full sm:w-48 max-w-[200px]">
                <Search
                  class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground"
                />
                <Input
                  v-model="filters.keyword"
                  placeholder="Cari guru..."
                  class="h-8 pl-8 w-full text-xs"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </div>
    </Card>
  </div>

  <!-- Mobile Filter Dialog -->
  <Dialog v-model:open="isFilterDialogOpen">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>Filter Guru</DialogTitle>
        <DialogDescription class="sr-only">
          Saring daftar guru berdasarkan kategori, jabatan, dan status.
        </DialogDescription>
      </DialogHeader>

      <div class="p-6 space-y-4">
        <!-- Category -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground"
            >Kategori</label
          >
          <Select
            :model-value="filters.positionCategoryId || 'all'"
            @update:model-value="
              handleFilterChange('positionCategoryId', $event)
            "
          >
            <SelectTrigger class="w-full">
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
        </div>

        <!-- Status -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground"
            >Status</label
          >
          <Select
            :model-value="filters.statusFilter"
            @update:model-value="handleFilterChange('statusFilter', $event)"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"> Semua Status </SelectItem>
              <SelectItem value="active"> Aktif </SelectItem>
              <SelectItem value="inactive"> Nonaktif </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter
        class="px-6 py-4 border-t bg-muted/20 flex flex-row items-center justify-end gap-2"
      >
        <Button
          variant="outline"
          size="sm"
          class="flex-1 sm:flex-none"
          @click="resetAllFilters"
        >
          Atur Ulang
        </Button>
        <Button
          size="sm"
          class="flex-1 sm:flex-none"
          @click="isFilterDialogOpen = false"
        >
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <TeacherFormDialog
    v-if="can('teachers.update')"
    v-model:open="isModalOpen"
    :form-error="formError"
    :is-saving="isSaving"
    :edit-data="editingItem"
    @save="handleSaveTeacher"
    @save-position="handleSavePosition"
  />

  <ImportExportDialog
    v-if="canImport"
    v-model:open="isImportExportOpen"
    :is-processing="isImporting"
    :labels="teacherImportExportLabels"
    @download-template="downloadTemplate"
    @export-data="exportData"
    @import-data="handleFileUpload"
  />

  <ImportPreviewDialog
    v-model:open="isConflictDialogOpen"
    :rows="conflictRows"
    :columns="teacherImportColumns"
    :loading="isResolvingConflicts"
    @resolve="handleResolveConflicts"
  />
</template>
