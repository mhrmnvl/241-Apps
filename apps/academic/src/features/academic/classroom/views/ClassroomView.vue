<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Classroom } from '../types'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { Plus } from 'lucide-vue-next'
import { DataTable } from '@/ui'
import { createClassroomColumns } from '../components/columns'
import ClassroomFormSheet from '../components/ClassroomFormSheet.vue'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { useClassroomList } from '../composables/useClassroomList'

const router = useRouter()

const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Kelas', href: '/akademik/kelas' },
]

const {
  classrooms,
  classroomLevels,
  curricula,
  academicYears,
  totalClassrooms,
  loading,
  fetchClassrooms,
  fetchCurricula,
  fetchAcademicYears,
  fetchClassroomLevels,
  fetchSemesters,
  deleteClassroom,
} = useClassroomList()

const isAddModalOpen = ref(false)
const { isAdmin } = useRoleGuard()

const tableColumns = createClassroomColumns({
  showActions: isAdmin.value,
  onManageSupervisor: (item: Classroom) => {
    void router.push(`/akademik/kelas/${item.id}/kelola`)
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
  await Promise.all([
    fetchClassrooms(),
    fetchCurricula(),
    fetchAcademicYears(),
    fetchClassroomLevels(),
  ])
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
            Kelas
          </CardTitle>
          <Button
            v-if="isAdmin"
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
            :is-loading="loading"
            item-label="kelas"
            filter-column="displayName"
            filter-placeholder="Cari kelas..."
          />

          <ClassroomFormSheet
            v-if="isAdmin && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :curricula="curricula"
            :academic-years="academicYears"
            :classroom-levels="classroomLevels"
            @save-success="fetchClassrooms"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
