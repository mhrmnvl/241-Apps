import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Checkbox } from '@/ui/checkbox'
import { Badge } from '@/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Input } from '@/ui/input'
import type { AttendanceInputRow, AttendanceStatus } from '../types'
import {
  ATTENDANCE_STATUS_OPTIONS,
  toAttendanceStatus,
} from '../constants/attendance-status'

/**
 * The gate tap, on the school's clock.
 *
 * `toISOString()` converts to UTC first, so a tap at 07.15 WIB printed 00.15 —
 * the column read as though every child arrived at midnight.
 */
function gateTime(value: string) {
  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface AttendanceInputColumnCallbacks {
  onStatusChange: (enrollmentId: string, status: AttendanceStatus) => void
  onNoteChange: (enrollmentId: string, note: string) => void
}

export function createAttendanceInputColumns(
  callbacks: AttendanceInputColumnCallbacks,
): ColumnDef<AttendanceInputRow>[] {
  return [
    {
      id: 'select',
      header: ({ table }) =>
        h(Checkbox, {
          modelValue:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() ? 'indeterminate' : false),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(!!value),
          'aria-label': 'Pilih semua siswa',
          class: 'translate-y-[2px]',
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            row.toggleSelected(!!value),
          'aria-label': 'Pilih baris siswa',
          class: 'translate-y-[2px]',
        }),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'left' },
    },
    {
      accessorKey: 'nis',
      header: 'NIS',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.nis || '-',
    },
    {
      accessorKey: 'studentName',
      header: 'Nama Siswa',
      meta: { align: 'left' },
      cell: ({ row }) =>
        h(
          'span',
          { class: 'font-medium text-foreground text-xs' },
          row.original.studentName,
        ),
    },
    {
      id: 'gateStatus',
      header: 'Keterangan',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const r = row.original
        if (r.needsDecision) {
          return h(
            Badge,
            {
              variant: 'outline',
              class:
                'border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-medium text-[11px] px-2 py-0.5',
            },
            () => 'Perlu Keputusan',
          )
        }

        if (r.fromGate) {
          return h(
            'div',
            { class: 'flex items-center justify-center gap-1.5' },
            [
              h(
                Badge,
                {
                  variant: 'outline',
                  class:
                    'border-sky-500/40 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 font-medium text-[11px] px-2 py-0.5',
                },
                () => 'Gerbang',
              ),
              r.gateCheckInAt
                ? h(
                    'span',
                    { class: 'text-muted-foreground text-xs font-normal' },
                    gateTime(r.gateCheckInAt),
                  )
                : null,
            ],
          )
        }

        if (r.gateCheckInAt) {
          return h(
            'span',
            { class: 'text-muted-foreground text-xs font-normal' },
            `Tap ${gateTime(r.gateCheckInAt)}`,
          )
        }

        return h('span', { class: 'text-muted-foreground text-xs' }, '-')
      },
    },
    {
      id: 'status',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const r = row.original
        return h('div', { class: 'flex justify-center' }, [
          h(
            Select,
            {
              modelValue: r.status,
              // Reka's `Select` emits `AcceptableValue`, not `string` — the
              // value is checked against the five marks rather than asserted
              // to be one of them.
              'onUpdate:modelValue': (val: unknown) => {
                const status = toAttendanceStatus(val)
                if (status) callbacks.onStatusChange(r.enrollmentId, status)
              },
            },
            () => [
              h(SelectTrigger, { class: 'h-8 w-[130px] text-xs' }, () => [
                h(SelectValue),
              ]),
              h(SelectContent, () =>
                ATTENDANCE_STATUS_OPTIONS.map((option) =>
                  h(
                    SelectItem,
                    {
                      key: option.value,
                      value: option.value,
                      class: 'text-xs',
                    },
                    () => option.label,
                  ),
                ),
              ),
            ],
          ),
        ])
      },
    },
    {
      id: 'note',
      header: 'Catatan',
      meta: { align: 'left' },
      cell: ({ row }) => {
        const r = row.original
        return h(Input, {
          modelValue: r.note,
          placeholder: 'Catatan...',
          class: 'h-8 text-xs min-w-[150px]',
          'onUpdate:modelValue': (val: string | number) =>
            callbacks.onNoteChange(r.enrollmentId, String(val)),
        })
      },
    },
  ]
}
