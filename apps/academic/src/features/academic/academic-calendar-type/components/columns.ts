import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { AcademicCalendarType } from '../types'

export const createColumns = (
  onEdit: (item: AcademicCalendarType) => void,
  onDelete: (
    item: AcademicCalendarType,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<AcademicCalendarType>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Tipe Kalender',
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
          cell: ({ row }: { row: { original: AcademicCalendarType } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Tipe Kalender?',
              deleteDescription: `Yakin ingin menghapus tipe kalender "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => onEdit(item),
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => onDelete(item, callbacks),
            })
          },
        },
      ]
    : []),
]
