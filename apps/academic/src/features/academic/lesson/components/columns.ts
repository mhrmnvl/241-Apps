import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/ui/button'
import { CalendarDays } from 'lucide-vue-next'
import { formatEntityName } from '@/shared/utils/utils'
import type { LessonClassItem, LessonColumnActions } from '../types'

export const createLessonColumns = (
  actions: LessonColumnActions,
): ColumnDef<LessonClassItem>[] => [
  {
    accessorKey: 'code',
    header: 'Kode Kelas',
    meta: { align: 'center' },
    cell: ({ row }) => formatEntityName(row.original.code),
  },
  {
    id: 'status',
    header: 'Status',
    meta: { align: 'center' },
    cell: ({ row }) => (row.original.isActive ? 'Aktif' : 'Nonaktif'),
  },
  {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      const cls = row.original
      return h(
        Button,
        {
          size: 'sm',
          variant: 'outline',
          onClick: () => {
            if (actions.onManageSchedule) actions.onManageSchedule(cls)
          },
        },
        () => [h(CalendarDays, { class: 'size-4 mr-1.5' }), 'Atur Jadwal'],
      )
    },
  },
]
