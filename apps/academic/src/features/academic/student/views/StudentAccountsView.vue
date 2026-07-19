<script setup lang="ts">
import EditStudentAccountDialog from '../components/EditStudentAccountDialog.vue'

import { useStudent } from '../composables/useStudent'
import { createAccountColumns } from '../components/columns'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { watchDebounced } from '@vueuse/core'
import { Search } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'

import type { Student, StudentAccountUpdatePayload } from '../types'

const isEditModalOpen = ref(false)
const selectedStudent = ref<Student | null>(null)
const isSaving = ref(false)
const formError = ref<string | null>(null)

const tableColumns = computed(() =>
  createAccountColumns(
    {
      onEdit: (student) => {
        selectedStudent.value = student
        isEditModalOpen.value = true
      },
      onDelete: async (student, { closeAlert, setLoading }) => {
        setLoading(true)
        try {
          await deleteStudent(student.id)
          toast.success('Akun siswa berhasil dihapus')
          await fetchStudents()
          closeAlert()
        } catch (e: unknown) {
          toast.error(
            getIndonesianErrorMessage(e, 'Gagal menghapus akun siswa'),
          )
        } finally {
          setLoading(false)
        }
      },
    },
    classroomLevels.value,
  ),
)

async function handleSaveAccount(payload: StudentAccountUpdatePayload) {
  if (!selectedStudent.value) return
  isSaving.value = true
  formError.value = null
  try {
    const studentId = selectedStudent.value.id
    const userId = selectedStudent.value.user?.id
    const currentIsActive = selectedStudent.value.user?.isActive

    await updateStudentCredentials(studentId, userId, payload, currentIsActive)

    toast.success('Pembaruan akun berhasil disimpan')
    isEditModalOpen.value = false
    await fetchStudents()
  } catch (err: unknown) {
    formError.value = getIndonesianErrorMessage(
      err,
      'Gagal menyimpan perubahan',
    )
  } finally {
    isSaving.value = false
  }
}

const breadcrumbs = [
  { title: 'Siswa', href: '/students' },
  { title: 'Akun Siswa' },
]

const {
  students,
  classrooms,
  classroomLevels,
  totalStudents,
  loading,
  filters,
  fetchStudents,
  fetchClassrooms,
  fetchClassroomLevels,
  deleteStudent,
  updateStudentCredentials,
} = useStudent()

const keyword = ref('')

const filteredData = computed(() => {
  if (!keyword.value) return students.value
  const low = keyword.value.toLowerCase()
  return students.value.filter(
    (s) =>
      s.user.identifier.toLowerCase().includes(low) ||
      s.user.profile.name.toLowerCase().includes(low),
  )
})

watch(
  () => filters.value.classroomLevelId,
  async (newLevelId) => {
    filters.value.classroomId = 'all'
    await fetchClassrooms(newLevelId === 'all' ? undefined : newLevelId)
    await fetchStudents()
  },
)

watch(
  () => filters.value.classroomId,
  () => fetchStudents(),
)

watchDebounced(
  keyword,
  () => {
    /* noop */
  },
  { debounce: 300 },
)

onMounted(async () => {
  await Promise.all([
    fetchStudents(),
    fetchClassrooms(),
    fetchClassroomLevels(),
  ])
  window.addEventListener('reload-student-account-data', () => {
    void fetchStudents()
  })
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
            Akun Siswa
          </CardTitle>
        </CardHeader>
        <div class="p-6">
          <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <Select
              :model-value="filters.classroomLevelId"
              @update:model-value="
                filters.classroomLevelId =
                  typeof $event === 'string' ? $event : 'all'
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
                  v-for="lvl in classroomLevels"
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
                filters.classroomId =
                  typeof $event === 'string' ? $event : 'all'
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
                  {{ cls.displayName }}
                </SelectItem>
              </SelectContent>
            </Select>

            <div class="relative lg:ml-auto lg:w-[240px]">
              <Search
                class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                v-model="keyword"
                placeholder="Cari akun..."
                class="pl-9"
              />
            </div>
          </div>

          <DataTable
            :columns="tableColumns"
            :data="filteredData"
            :total-items="totalStudents"
            :is-loading="loading"
            item-label="akun siswa"
          />
        </div>
      </Card>
    </div>

    <EditStudentAccountDialog
      v-model:open="isEditModalOpen"
      :edit-data="selectedStudent"
      :is-saving="isSaving"
      :form-error="formError"
      @save="handleSaveAccount"
    />
  </AppLayout>
</template>
