import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import { dayShortLabel } from '../constants'
import type { TimeSlotType } from '../types'

export const createTimeSlotTypeColumns = (
  onEdit: (item: TimeSlotType) => void,
  onDelete: (
    item: TimeSlotType,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<TimeSlotType>[] => [
  {
    accessorKey: 'code',
    header: 'Kode',
  },
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    id: 'isLesson',
    header: 'Jenis',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: row.original.isLesson ? 'secondary' : 'outline' },
        () => (row.original.isLesson ? 'Pelajaran' : 'Khusus'),
      ),
  },
  {
    id: 'days',
    header: 'Hari Berlaku',
    cell: ({ row }) => {
      const days = row.original.days ?? []
      if (days.length === 0) {
        return h(
          'span',
          { class: 'text-muted-foreground text-xs' },
          'Semua hari',
        )
      }
      return h(
        'div',
        { class: 'flex flex-wrap gap-1' },
        days.map((d) =>
          h(Badge, { variant: 'outline', class: 'text-[11px]' }, () =>
            dayShortLabel(d),
          ),
        ),
      )
    },
  },
  ...(showActions
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          enableHiding: false,
          cell: ({ row }: { row: { original: TimeSlotType } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Tipe Jam?',
              deleteDescription: `Yakin ingin menghapus tipe "${item.name}"? Tipe yang masih dipakai jam pelajaran tidak dapat dihapus.`,
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
