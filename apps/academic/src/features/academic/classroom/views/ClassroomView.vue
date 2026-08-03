<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Classroom } from '../types'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { Plus, Search } from 'lucide-vue-next'
import { DataTable } from '@/ui'
import { createClassroomColumns } from '../components/columns'
import ClassroomFormDialog from '../components/ClassroomFormDialog.vue'
import { useRoleGuard } from '@/features/platform/auth'
import { useClassroomList } from '../composables/useClassroomList'
import { watchDebounced } from '@vueuse/core'
import { Input } from '@/ui/input'

const router = useRouter()

const {
  classrooms,
  grades,
  academicYears,
  totalClassrooms,
  loading,
  currentFilters,
  fetchClassrooms,
  fetchAcademicYears,
  fetchGrades,
  fetchSemesters,
  deleteClassroom,
} = useClassroomList()
const searchKeyword = ref(currentFilters.value.search ?? '')

watchDebounced(
  searchKeyword,
  (val) => {
    void fetchClassrooms({
      search: val.trim() || '',
      page: 1,
    })
  },
  { debounce: 500 },
)

const isAddModalOpen = ref(false)
const { can } = useRoleGuard()

const tableColumns = createClassroomColumns({
  showActions: can('classrooms.update') || can('classrooms.delete'),
  canUpdate: can('classrooms.update'),
  canDelete: can('classrooms.delete'),
  onManageSupervisor: (item: Classroom) => {
    void router.push({ name: 'classroom-manage', params: { id: item.id } })
  },
  onDelete: async (item: Classroom, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteClassroom(item.id)
    if (result.success) {
      await fetchClassrooms()
      closeAlert()
    }
    setLoading(false)
  },
})

onMounted(async () => {
  await fetchSemesters()
  await Promise.all([fetchClassrooms(), fetchAcademicYears(), fetchGrades()])
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight"> Kelas </CardTitle>
        <Button
          v-if="can('classrooms.create')"
          @click="isAddModalOpen = true"
        >
          <Plus class="size-4 mr-2" />
          Tambah
        </Button>
      </CardHeader>

      <div class="p-6 space-y-4">
        <DataTable
          :columns="tableColumns"
          :data="classrooms"
          :total-items="totalClassrooms"
          :page="currentFilters.page"
          :is-loading="loading"
          item-label="kelas"
          @update:page="(page) => fetchClassrooms({ page })"
          @update:page-size="(limit) => fetchClassrooms({ limit, page: 1 })"
        >
          <template #header-right>
            <div class="relative w-full sm:w-48 max-w-[200px]">
              <Search
                class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground"
              />
              <Input
                v-model="searchKeyword"
                placeholder="Cari kelas..."
                class="h-8 pl-8 w-full text-xs"
              />
            </div>
          </template>
        </DataTable>

        <ClassroomFormDialog
          v-if="can('classrooms.create') && isAddModalOpen"
          v-model:open="isAddModalOpen"
          :academic-years="academicYears"
          :grades="grades"
          @save-success="fetchClassrooms"
        />
      </div>
    </Card>
  </div>
</template>
