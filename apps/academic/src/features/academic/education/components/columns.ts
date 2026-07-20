import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { EducationLevel } from '../types'

export const createColumns = (
  onEdit: (item: EducationLevel) => void,
  onDelete: (
    item: EducationLevel,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<EducationLevel>[] => [
  {
    accessorKey: 'name',
    header: 'Tingkat Pendidikan',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    meta: { align: 'center' },
    cell: ({ row }) => {
      return row.original.isActive ? 'Aktif' : 'Tidak Aktif'
    },
  },
  ...(showActions
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          enableHiding: false,
          cell: ({ row }: { row: { original: EducationLevel } }) => {
            const education = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Tingkat Pendidikan?',
              deleteDescription: `Yakin ingin menghapus tingkat pendidikan "${education.name}"? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => onEdit(education),
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => onDelete(education, callbacks),
            })
          },
        },
      ]
    : []),
]
