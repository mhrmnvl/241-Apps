<script setup lang="ts">
import { DataTable } from '@/ui'
import { Card, CardContent } from '@/ui/card'
import { h, onMounted, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { studentScoreApi } from '../api/studentScoreApi'
import type { StudentScoreItem } from '../types'

/**
 * A student's own marks, per assessment.
 *
 * Assessments the teacher has not marked yet are shown with the mark blank
 * rather than left out. A student wants to know what is still outstanding, and
 * an assessment that simply does not appear reads as one that does not exist.
 *
 * Nothing here marks anything: this is the same data the grading table holds,
 * from the other side.
 */
const rows = ref<StudentScoreItem[]>([])
const loading = ref(false)

const columns: ColumnDef<StudentScoreItem>[] = [
  {
    id: 'assessment',
    header: 'Penilaian',
    cell: ({ row }) => row.original.assessmentItem?.name ?? '-',
  },
  {
    id: 'type',
    header: 'Jenis',
    cell: ({ row }) =>
      row.original.assessmentItem?.type
        ? h(
            Badge,
            { variant: 'secondary' },
            () => row.original.assessmentItem!.type,
          )
        : '-',
  },
  {
    accessorKey: 'score',
    header: 'Nilai',
    cell: ({ row }) => {
      const score = row.original.score
      // Null and undefined are "not marked yet", which is a real state and not
      // a zero. Showing 0 would tell a student they failed something nobody has
      // looked at.
      return score === null || score === undefined
        ? h('span', { class: 'text-muted-foreground' }, 'Belum dinilai')
        : String(score)
    },
  },
]

async function load() {
  loading.value = true
  try {
    const res = await studentScoreApi.getMyScores({ limit: 500 })
    rows.value = res.data?.data ?? []
  } catch (error: unknown) {
    rows.value = []
    toast.error(getIndonesianErrorMessage(error, 'Gagal memuat nilai Anda.'))
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())
</script>

<template>
  <div class="space-y-6 p-4 md:p-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Nilai Saya</h1>
      <p class="text-sm text-muted-foreground">
        Nilai per penilaian pada semester berjalan.
      </p>
    </div>

    <Card v-if="!loading && rows.length === 0">
      <CardContent class="py-10 text-center text-sm text-muted-foreground">
        Belum ada penilaian untuk Anda pada semester ini. Nilai muncul di sini
        setelah guru membuat penilaian dan mengisinya.
      </CardContent>
    </Card>

    <DataTable
      v-else
      :columns="columns"
      :data="rows"
      :is-loading="loading"
    />
  </div>
</template>
