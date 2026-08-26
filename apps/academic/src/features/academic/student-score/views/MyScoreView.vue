<script setup lang="ts">
import { DataTable } from '@/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { computed, h, onMounted, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { studentScoreApi } from '../api/studentScoreApi'
import type { StudentScoreItem } from '../types'

/**
 * A student's own marks, per assessment.
 */
const rows = ref<StudentScoreItem[]>([])
const loading = ref(false)

const TYPE_LABELS: Record<string, string> = {
  DAILY: 'Harian',
  MIDTERM: 'UTS',
  FINAL: 'UAS',
  ASSIGNMENT: 'Tugas',
  PRACTICAL: 'Praktik',
}

const TYPE_ORDER: Record<string, number> = {
  DAILY: 1,
  ASSIGNMENT: 2,
  PRACTICAL: 3,
  MIDTERM: 4,
  FINAL: 5,
}

const sortedRows = computed(() => {
  return [...rows.value].sort((a, b) => {
    const subjectA = a.assessmentItem?.teachingAssignment?.subject?.name ?? ''
    const subjectB = b.assessmentItem?.teachingAssignment?.subject?.name ?? ''
    const compareSubject = subjectA.localeCompare(subjectB, 'id')
    if (compareSubject !== 0) return compareSubject

    const typeA = a.assessmentItem?.type ?? ''
    const typeB = b.assessmentItem?.type ?? ''
    const orderA = TYPE_ORDER[typeA] ?? 99
    const orderB = TYPE_ORDER[typeB] ?? 99
    if (orderA !== orderB) return orderA - orderB

    const itemA = a.assessmentItem?.name ?? ''
    const itemB = b.assessmentItem?.name ?? ''
    return itemA.localeCompare(itemB, 'id')
  })
})

const columns: ColumnDef<StudentScoreItem>[] = [
  {
    id: 'subject',
    header: 'Mata Pelajaran',
    meta: { align: 'left' },
    cell: ({ row }) =>
      row.original.assessmentItem?.teachingAssignment?.subject?.name ?? '-',
  },
  {
    id: 'teacher',
    header: 'Guru Pengampu',
    meta: { align: 'left' },
    cell: ({ row }) =>
      row.original.assessmentItem?.teachingAssignment?.teacher?.user?.profile
        ?.name ?? '-',
  },
  {
    id: 'assessment',
    header: 'Penilaian',
    meta: { align: 'left' },
    cell: ({ row }) => row.original.assessmentItem?.name ?? '-',
  },
  {
    id: 'type',
    header: 'Jenis',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const type = row.original.assessmentItem?.type
      if (!type) return '-'
      return h(
        Badge,
        { variant: 'secondary', class: 'font-medium text-xs' },
        () => TYPE_LABELS[type] ?? type,
      )
    },
  },
  {
    accessorKey: 'score',
    header: 'Nilai',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const score = row.original.score
      return score === null || score === undefined
        ? h('span', { class: 'text-muted-foreground text-xs' }, 'Belum dinilai')
        : h(
            'span',
            { class: 'font-semibold tabular-nums text-sm' },
            String(score),
          )
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
  <div class="p-4 md:p-5 lg:p-6">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Nilai Saya
        </CardTitle>
      </CardHeader>

      <div class="p-6 space-y-4">
        <!-- Empty state -->
        <Card
          v-if="!loading && sortedRows.length === 0"
          class="shadow-none"
        >
          <CardContent class="py-10 text-center text-sm text-muted-foreground">
            Belum ada penilaian untuk Anda pada semester ini. Nilai muncul di
            sini setelah guru membuat penilaian dan mengisinya.
          </CardContent>
        </Card>

        <!-- Data table -->
        <DataTable
          v-else
          :columns="columns"
          :data="sortedRows"
          :is-loading="loading"
          item-label="nilai"
        />
      </div>
    </Card>
  </div>
</template>
