import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import { formatEntityName } from '@/shared/utils/utils'
import type { TimeSlot, TimeSlotColumnActions } from '../types'

function formatTime(isoOrTime: string): string {
  if (!isoOrTime) return '-'
  try {
    const d = new Date(isoOrTime)
    if (!isNaN(d.getTime())) return d.toISOString().substring(11, 16)
  } catch {
    void 0
  }
  return isoOrTime.substring(0, 5)
}

const TIME_SLOT_TYPE_LABELS: Record<string, string> = {
  LESSON: 'Pelajaran',
  TAHFIDZ: 'Tahfidz',
  CEREMONY: "Upacara/Ba'iat",
  BREAK: 'Istirahat',
}

export const createTimeSlotColumns = (
  actions: TimeSlotColumnActions,
): ColumnDef<TimeSlot>[] => [
  {
    id: 'name',
    header: 'Nama Jam',
    meta: { align: 'center' },
    cell: ({ row }) => formatEntityName(row.original.name),
  },
  {
    id: 'startTime',
    header: 'Mulai (WIB)',
    meta: { align: 'center' },
    cell: ({ row }) => `${formatTime(row.original.startTime)} WIB`,
  },
  {
    id: 'endTime',
    header: 'Selesai (WIB)',
    meta: { align: 'center' },
    cell: ({ row }) => `${formatTime(row.original.endTime)} WIB`,
  },
  {
    id: 'order',
    header: 'Urutan',
    meta: { align: 'center' },
    accessorKey: 'order',
  },
  {
    id: 'type',
    header: 'Tipe',
    meta: { align: 'center' },
    cell: ({ row }) =>
      h(
        Badge,
        { variant: 'outline' },
        () => TIME_SLOT_TYPE_LABELS[row.original.type] ?? 'Pelajaran',
      ),
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: TimeSlot } }) => {
            const ts = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Jam Pelajaran?',
              deleteDescription: `Yakin ingin menghapus jam pelajaran "${ts.name}"?`,
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(ts)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete) return actions.onDelete(ts, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
