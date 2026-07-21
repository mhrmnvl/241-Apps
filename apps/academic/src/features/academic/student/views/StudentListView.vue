<script setup lang="ts">
import ImportExportDialog from '../components/ImportExportDialog.vue'
import { createColumns } from '../components/columns'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { formatEntityName } from '@/shared/utils/utils'
import { watchDebounced } from '@vueuse/core'
import { computed, onMounted, watch } from 'vue'
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
import { ArrowLeftRight, Plus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
const { isAdmin } = useRoleGuard()
const router = useRouter()
const breadcrumbs = [
  { title: 'Siswa', href: '/students' },
  { title: 'Daftar Siswa' },
]

const {
  students,
  classrooms,
  grades,
  totalStudents,
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
      showActions: isAdmin.value,
    },
    grades.value,
  ),
)

const {
  isImportExportOpen,
  isImporting,
  downloadTemplate,
  exportData,
  handleFileUpload,
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
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Daftar Siswa
            </CardTitle>
          </div>
          <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button
              v-if="isAdmin"
              variant="outline"
              class="w-full sm:w-auto"
              @click="isImportExportOpen = true"
            >
              <ArrowLeftRight class="size-4 mr-2" />
              Import / Export
            </Button>
            <Button
              v-if="isAdmin"
              class="w-full sm:w-auto"
              @click="router.push('/students/create')"
            >
              <Plus class="size-4 mr-2" />
              Tambah Siswa
            </Button>
          </div>
        </CardHeader>
        <div class="p-6">
          <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <Select
              :model-value="filters.gradeId"
              @update:model-value="
                (val) => {
                  filters.gradeId = typeof val === 'string' ? val : 'all'
                }
              "
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
              @update:model-value="
                (val) => {
                  filters.classroomId = typeof val === 'string' ? val : 'all'
                }
              "
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

            <div class="relative lg:ml-auto lg:w-[240px]">
              <Search
                class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                v-model="filters.keyword"
                placeholder="Cari siswa..."
                class="pl-9"
              />
            </div>
          </div>

          <DataTable
            :columns="tableColumns"
            :data="filteredStudents"
            :total-items="totalStudents"
            :is-loading="loading"
            item-label="siswa"
          />
        </div>
      </Card>
    </div>

    <ImportExportDialog
      v-if="isAdmin"
      v-model:open="isImportExportOpen"
      :is-processing="isImporting"
      @download-template="downloadTemplate"
      @export-data="exportData"
      @import-data="handleFileUpload"
    />
  </AppLayout>
</template>
