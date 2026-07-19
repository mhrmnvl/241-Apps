<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { createLessonColumns } from '../components/columns'
import { useLessonClassrooms } from '../composables/useLessonClassrooms'
import type { LessonClassItem } from '../types'

const router = useRouter()
const breadcrumbs = [
  { title: 'Pembelajaran', href: '#' },
  { title: 'Jadwal Pelajaran' },
]

const {
  classrooms,
  loading: isLoading,
  fetchClassrooms,
} = useLessonClassrooms()

const tableColumns = createLessonColumns({
  onManageSchedule: (cls: LessonClassItem) => {
    void router.push({
      name: 'classroom-schedule-editor',
      params: { classroomId: cls.id },
    })
  },
})

onMounted(() => {
  void fetchClassrooms()
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
            Jadwal Pelajaran
          </CardTitle>
        </CardHeader>
        <div class="p-6">
          <DataTable
            :columns="tableColumns"
            :data="classrooms"
            :is-loading="isLoading"
            item-label="kelas"
            filter-column="code"
            filter-placeholder="Cari kelas..."
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
