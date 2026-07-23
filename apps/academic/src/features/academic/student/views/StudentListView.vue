<script setup lang="ts">
import ImportExportDialog from '../components/ImportExportDialog.vue'
import ImportPreviewDialog from '../components/ImportPreviewDialog.vue'
import { createColumns } from '../components/columns'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { formatEntityName } from '@/shared/utils/utils'
import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStudent } from '../composables/useStudent'
import { useStudentImportExport } from '../composables/useStudentImportExport'
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
import { ArrowLeftRight, Plus, Search, Filter } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { useRoleGuard } from '@/features/platform/auth'

const { can } = useRoleGuard()
const router = useRouter()

const isFilterDialogOpen = ref(false)

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.gradeId !== 'all') count++
  if (filters.value.classroomId !== 'all') count++
  return count
})

function resetAllFilters() {
  filters.value.gradeId = 'all'
  filters.value.classroomId = 'all'
}

function handleFilterChange(key: 'gradeId' | 'classroomId', value: unknown) {
  filters.value[key] = typeof value === 'string' ? value : 'all'
}
const breadcrumbs = [
  { title: 'Siswa', href: '/student' },
  { title: 'Daftar Siswa' },
]

const {
  students,
  classrooms,
  grades,
  loading,
  filters,
  fetchStudents,
  fetchClassrooms,
  fetchGrades,
  deleteStudent,
  filteredStudents,
} = useStudent()

const tableColumns = computed(() =>
  createColumns(
    {
      onViewDetail: (student) => {
        void router.push(`/profile/STUDENT/${student.user.id}`)
      },
      onDelete: async (student, { closeAlert, setLoading }) => {
        setLoading(true)
        try {
          await deleteStudent(student.id)
          toast.success('Siswa berhasil dihapus')
          await fetchStudents()
          closeAlert()
        } catch (e: unknown) {
          toast.error(
            getIndonesianErrorMessage(e, 'Gagal menghapus data siswa'),
          )
        } finally {
          setLoading(false)
        }
      },
      showActions: can('students.update') || can('students.delete'),
      canUpdate: can('students.update'),
      canDelete: can('students.delete'),
    },
    grades.value,
  ),
)

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
} = useStudentImportExport({
  students: students,
  classes: classrooms,
  onImportSuccess: () => {
    void fetchStudents()
  },
})

watch(
  () => filters.value.gradeId,
  async (newGradeId) => {
    filters.value.classroomId = 'all'
    await fetchClassrooms(newGradeId === 'all' ? undefined : newGradeId)
    await fetchStudents()
  },
)

watch(
  () => filters.value.classroomId,
  () => fetchStudents(),
)

watchDebounced(
  () => filters.value.keyword,
  () => fetchStudents(),
  { debounce: 400 },
)

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchClassrooms(), fetchGrades()])
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5 gap-4"
        >
          <div>
            <CardTitle class="text-xl sm:text-2xl font-bold tracking-tight">
              Daftar Siswa
            </CardTitle>
          </div>
          <div class="flex items-center gap-2">
            <!-- Desktop Action Buttons -->
            <div class="hidden sm:flex items-center gap-2">
              <Button
                v-if="can('students.create')"
                variant="outline"
                size="sm"
                class="h-10 px-4 bg-white"
                @click="isImportExportOpen = true"
              >
                <ArrowLeftRight class="size-4 mr-2" />
                Import / Export
              </Button>
              <Button
                v-if="can('students.create')"
                size="sm"
                class="h-10 px-4"
                @click="router.push('/student/create')"
              >
                <Plus class="size-4 mr-2" />
                Tambah Siswa
              </Button>
            </div>

            <!-- Mobile Action Dropdown -->
            <div
              v-if="can('students.create')"
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
                  <DropdownMenuItem @click="router.push('/student/create')">
                    <Plus class="size-4 mr-2 text-muted-foreground" />
                    Tambah Siswa
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="isImportExportOpen = true">
                    <ArrowLeftRight class="size-4 mr-2 text-muted-foreground" />
                    Import / Export
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <div class="p-6 pt-1">
          <!-- Filters Section matching Academic Layout -->
          <div class="mb-6">
            <!-- Desktop Layout: Inline selects -->
            <div class="hidden lg:flex lg:flex-row lg:items-center gap-3">
              <Select
                :model-value="filters.gradeId"
                @update:model-value="handleFilterChange('gradeId', $event)"
              >
                <SelectTrigger
                  class="w-full lg:w-fit lg:min-w-[145px] px-3! gap-2!"
                >
                  <SelectValue placeholder="Pilih tingkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"> Semua Tingkat </SelectItem>
                  <SelectItem
                    v-for="lvl in grades"
                    :key="lvl.id"
                    :value="lvl.id"
                  >
                    {{ lvl.name }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                :model-value="filters.classroomId"
                @update:model-value="handleFilterChange('classroomId', $event)"
              >
                <SelectTrigger
                  class="w-full lg:w-fit lg:min-w-[140px] px-3! gap-2!"
                >
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"> Semua Kelas </SelectItem>
                  <SelectItem
                    v-for="cls in classrooms"
                    :key="cls.id"
                    :value="cls.id"
                  >
                    {{ formatEntityName(cls.displayName) }}
                  </SelectItem>
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
                Filter Siswa
                <span
                  v-if="activeFiltersCount > 0"
                  class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                >
                  {{ activeFiltersCount }}
                </span>
              </Button>
            </div>
          </div>

          <DataTable
            :columns="tableColumns"
            :data="filteredStudents"
            :is-loading="loading"
            item-label="siswa"
          >
            <template #header-right>
              <div class="relative w-full sm:w-48 max-w-[200px]">
                <Search
                  class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground"
                />
                <Input
                  v-model="filters.keyword"
                  placeholder="Cari siswa..."
                  class="h-8 pl-8 w-full text-xs"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </Card>
    </div>

    <!-- Mobile Filter Dialog -->
    <Dialog v-model:open="isFilterDialogOpen">
      <DialogContent
        class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
          <DialogTitle>Filter Siswa</DialogTitle>
          <DialogDescription class="sr-only">
            Saring daftar siswa berdasarkan tingkat dan kelas.
          </DialogDescription>
        </DialogHeader>

        <div class="p-6 space-y-4">
          <!-- Grade / Tingkat -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-muted-foreground"
              >Tingkat</label
            >
            <Select
              :model-value="filters.gradeId"
              @update:model-value="handleFilterChange('gradeId', $event)"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Pilih tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"> Semua Tingkat </SelectItem>
                <SelectItem
                  v-for="lvl in grades"
                  :key="lvl.id"
                  :value="lvl.id"
                >
                  {{ lvl.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Classroom / Kelas -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-muted-foreground"
              >Kelas</label
            >
            <Select
              :model-value="filters.classroomId"
              @update:model-value="handleFilterChange('classroomId', $event)"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"> Semua Kelas </SelectItem>
                <SelectItem
                  v-for="cls in classrooms"
                  :key="cls.id"
                  :value="cls.id"
                >
                  {{ formatEntityName(cls.displayName) }}
                </SelectItem>
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

    <ImportExportDialog
      v-if="can('students.create')"
      v-model:open="isImportExportOpen"
      :is-processing="isImporting"
      @download-template="downloadTemplate"
      @export-data="exportData"
      @import-data="handleFileUpload"
    />

    <ImportPreviewDialog
      v-model:open="isConflictDialogOpen"
      :conflicts="conflictRows"
      :loading="isResolvingConflicts"
      @resolve="handleResolveConflicts"
    />
  </AppLayout>
</template>
