import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { CalendarEventData, CalendarColumnActions } from '../types'
import { Checkbox } from '@/ui/checkbox'
import { createActionColumn } from './calendarActionColumn'

export const createCalendarColumns = (
  actions: CalendarColumnActions,
): ColumnDef<CalendarEventData>[] => [
  ...(actions.showActions !== false
    ? [
        {
          id: 'select',
          header: ({
            table,
          }: {
            table: {
              getIsAllPageRowsSelected: () => boolean
              getIsSomePageRowsSelected: () => boolean
              toggleAllPageRowsSelected: (v: boolean) => void
            }
          }) =>
            h(Checkbox, {
              checked:
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate'),
              'onUpdate:checked': (value: boolean) =>
                table.toggleAllPageRowsSelected(!!value),
              ariaLabel: 'Select all',
            }),
          cell: ({
            row,
          }: {
            row: {
              getIsSelected: () => boolean
              toggleSelected: (v: boolean) => void
            }
          }) =>
            h(Checkbox, {
              checked: row.getIsSelected(),
              'onUpdate:checked': (value: boolean) =>
                row.toggleSelected(!!value),
              ariaLabel: 'Select row',
            }),
          enableSorting: false,
          enableHiding: false,
        },
      ]
    : []),
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Nama Agenda',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.title),
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Kategori',
    cell: ({ row }) => row.original.type?.name ?? '-',
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: 'Tanggal Mulai',
    cell: ({ row }) => {
      const d = new Date(row.original.startDate)
      return h(
        'div',
        d.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      )
    },
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: 'Tanggal Selesai',
    cell: ({ row }) => {
      const d = new Date(row.original.endDate)
      return h(
        'div',
        d.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      )
    },
  },
  ...(actions.showActions !== false ? [createActionColumn(actions)] : []),
]
