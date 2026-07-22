import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { AssessmentItem } from '@/features/academic/assessment-item'
import type { StudentScoreRow, StudentScoreColumnActions } from '../types'

export const createstudentScoreColumns = (
  actions: StudentScoreColumnActions,
  assessmentItems: AssessmentItem[] = [],
): ColumnDef<StudentScoreRow>[] => {
  const baseColumns: ColumnDef<StudentScoreRow>[] = [
    {
      id: 'nis',
      header: 'NIS',
      accessorFn: (row) => row.student?.nis ?? '-',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.student?.nis ?? '-',
    },
    {
      id: 'studentName',
      header: 'Nama Siswa',
      accessorFn: (row) => row.student?.user?.profile?.name ?? '-',
      cell: ({ row }) => row.original.student?.user?.profile?.name ?? '-',
    },
  ]

  const dynamicColumns: ColumnDef<StudentScoreRow>[] = assessmentItems.map(
    (item) => ({
      id: `assessment_${item.id}`,
      header: item.name,
      meta: { align: 'center' },
      cell: ({ row }) => {
        const scoreObj = row.original.scores?.[item.id]
        return scoreObj?.score ?? '-'
      },
    }),
  )

  if (actions.canUpdate === false) {
    return [...baseColumns, ...dynamicColumns]
  }

  const actionColumn: ColumnDef<StudentScoreRow> = {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      const item = row.original
      const hasScores = item.scores && Object.keys(item.scores).length > 0

      return h(ActionCell, {
        editLabel: hasScores ? 'Edit Nilai' : 'Input Nilai',
        hideDelete: true,
        onEdit: () => actions.onEdit?.(item),
      })
    },
  }

  return [...baseColumns, ...dynamicColumns, actionColumn]
}
