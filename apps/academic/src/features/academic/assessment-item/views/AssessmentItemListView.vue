<script setup lang="ts">
import AssessmentItemFormDialog from '../components/AssessmentItemFormDialog.vue'
import { createAssessmentItemColumns } from '../components/columns'
import { useAssessmentItem } from '../composables/useAssessmentItem'
import type { AssessmentItem } from '../types'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
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
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { Plus, Filter } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { can } = useRoleGuard()

const breadcrumbs = [
  { title: 'Penilaian', href: '#' },
  { title: 'Tugas & Nilai', href: '/akademik/student-scores' },
]

const {
  items,
  totalItems,
  loading,
  formError,
  classrooms,
  subjects,
  semesters,
  selectedClassroomId,
  selectedSubjectId,
  selectedSemesterId,
  teachingAssignment,
  fetchRelatedData,
  fetchItems,
  deleteItem,
} = useAssessmentItem()

interface FilterOption {
  value: string
  label: string
}

const semesterFilterOptions = computed<FilterOption[]>(() =>
  semesters.value.map((s) => ({
    value: s.id,
    label: `${s.academicYear?.name ?? ''} - ${s.type.name} (${s.isActive ? 'Aktif' : 'Tidak Aktif'})`,
  })),
)
const classroomFilterOptions = computed<FilterOption[]>(() =>
  classrooms.value.map((c) => ({
    value: c.id,
    label: c.code ?? '-',
  })),
)
const subjectFilterOptions = computed<FilterOption[]>(() =>
  subjects.value.map((s) => ({
    value: s.id,
    label: `${s.name} (Kelas ${s.gradeLevel ?? '-'})`,
  })),
)

const openForm = ref(false)
const editingItem = ref<AssessmentItem | null>(null)
const hasDisplayedData = ref(false)
const isFilterDialogOpen = ref(false)

const isFilterReady = computed(() =>
  Boolean(selectedClassroomId.value && selectedSubjectId.value),
)

const canCreate = computed(() => can('assessment-items.create'))
const canUpdate = computed(() => can('assessment-items.update'))
const canDelete = computed(() => can('assessment-items.delete'))

const columns = computed(() =>
  createAssessmentItemColumns({
    canUpdate: canUpdate.value,
    canDelete: canDelete.value,
    onEdit: (item) => {
      editingItem.value = item
      openForm.value = true
    },
    onGrade: (item) => {
      router.push(`/akademik/student-scores/${item.id}/nilai`)
    },
    onDelete: async (item, { closeAlert, setLoading }) => {
      setLoading(true)
      const result = await deleteItem(item.id)
      setLoading(false)
      if (result.success) {
        closeAlert()
        void fetchItems()
      }
    },
  }),
)

async function handleFilter() {
  isFilterDialogOpen.value = false
  if (!isFilterReady.value) return
  hasDisplayedData.value = true
  await fetchItems()
}

function openAddForm() {
  editingItem.value = null
  openForm.value = true
}

watch(openForm, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

watch([selectedClassroomId, selectedSubjectId, selectedSemesterId], () => {
  if (isFilterReady.value) {
    void handleFilter()
  } else {
    hasDisplayedData.value = false
  }
})

onMounted(async () => {
  await fetchRelatedData()
  selectedSemesterId.value ??=
    semesters.value.find((semester) => semester.isActive)?.id ?? null
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
          <CardTitle class="text-2xl font-bold tracking-tight">
            Tugas & Nilai
          </CardTitle>
          <Button
            v-if="hasDisplayedData && teachingAssignment && canCreate"
            @click="openAddForm"
          >
            <Plus class="size-4 mr-2" />
            Tambah Tugas
          </Button>
        </CardHeader>

        <div class="space-y-6 p-6">
          <!-- Desktop Filter Bar -->
          <div class="hidden lg:flex lg:flex-row lg:items-center gap-3 mb-6">
            <Select v-model="selectedSemesterId">
              <SelectTrigger class="w-[200px]">
                <SelectValue placeholder="Pilih Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="s in semesterFilterOptions"
                  :key="s.value"
                  :value="s.value"
                >
                  {{ s.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedClassroomId">
              <SelectTrigger class="w-[150px]">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="c in classroomFilterOptions"
                  :key="c.value"
                  :value="c.value"
                >
                  {{ c.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedSubjectId">
              <SelectTrigger class="w-[220px]">
                <SelectValue placeholder="Pilih Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="sub in subjectFilterOptions"
                  :key="sub.value"
                  :value="sub.value"
                >
                  {{ sub.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Mobile Filter Bar -->
          <div class="flex lg:hidden items-center gap-2 mb-6">
            <Button
              variant="outline"
              class="w-full relative justify-center"
              @click="isFilterDialogOpen = true"
            >
              <Filter class="size-4 mr-2" />
              Filter Tugas & Nilai
            </Button>
          </div>

          <!-- Mobile Filter Dialog -->
          <Dialog v-model:open="isFilterDialogOpen">
            <DialogContent
              class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
            >
              <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
                <DialogTitle>Filter Tugas & Nilai</DialogTitle>
                <DialogDescription class="sr-only">
                  Saring data berdasarkan semester, kelas, dan mata pelajaran.
                </DialogDescription>
              </DialogHeader>

              <div class="p-6 space-y-4">
                <div class="grid gap-2">
                  <Label>Tahun Ajaran / Semester</Label>
                  <Select v-model="selectedSemesterId">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="s in semesterFilterOptions"
                        :key="s.value"
                        :value="s.value"
                      >
                        {{ s.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="grid gap-2">
                  <Label>Kelas</Label>
                  <Select v-model="selectedClassroomId">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="c in classroomFilterOptions"
                        :key="c.value"
                        :value="c.value"
                      >
                        {{ c.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="grid gap-2">
                  <Label>Mata Pelajaran</Label>
                  <Select v-model="selectedSubjectId">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="sub in subjectFilterOptions"
                        :key="sub.value"
                        :value="sub.value"
                      >
                        {{ sub.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter
                class="p-6 border-t bg-muted/10 flex items-center justify-end gap-2 shrink-0"
              >
                <Button
                  class="w-full"
                  @click="isFilterDialogOpen = false"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DataTable
            v-if="hasDisplayedData"
            :columns="columns"
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="tugas"
            filter-column="name"
            filter-placeholder="Cari nama tugas..."
          />

          <div
            v-else
            class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 px-6 py-16 text-center"
          >
            <h3 class="text-lg font-semibold text-foreground">
              {{
                isFilterReady ? 'Data Siap Ditampilkan' : 'Pilih Konteks Nilai'
              }}
            </h3>
            <p class="mt-2 max-w-sm text-sm text-muted-foreground">
              {{
                isFilterReady
                  ? 'Klik Tampilkan untuk memuat daftar tugas sesuai konteks yang dipilih.'
                  : 'Pilih kelas dan mata pelajaran terlebih dahulu untuk mulai mengelola tugas.'
              }}
            </p>
          </div>

          <AssessmentItemFormDialog
            v-if="canCreate || canUpdate"
            v-model:open="openForm"
            :teaching-assignment-id="teachingAssignment?.id ?? null"
            :edit-data="editingItem"
            @save-success="fetchItems"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
