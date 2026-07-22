import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import type { Parent, ParentColumnActions } from '../types'
import { getIncomeRangeLabel } from '../types'

export const createParentColumns = (
  actions: ParentColumnActions,
): ColumnDef<Parent>[] => [
  {
    id: 'name',
    header: 'Nama',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name),
  },
  {
    id: 'nik',
    header: 'NIK',
    cell: ({ row }) =>
      h('code', { class: 'font-mono text-xs' }, row.original.nik),
  },
  {
    id: 'birthPlaceDate',
    header: 'Tempat, Tgl Lahir',
    cell: ({ row }) => {
      const date = new Date(row.original.birthDate)
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      return h('div', `${row.original.birthPlace}, ${formattedDate}`)
    },
  },
  {
    id: 'phone',
    header: 'Telepon',
    cell: ({ row }) => h('div', row.original.phone ?? '-'),
  },
  {
    id: 'occupation',
    header: 'Pekerjaan',
    cell: ({ row }) => h('div', row.original.occupation?.name ?? '-'),
  },
  {
    id: 'income',
    header: 'Penghasilan',
    cell: ({ row }) => h('div', getIncomeRangeLabel(row.original.income)),
  },
  {
    id: 'children',
    header: 'Anak',
    cell: ({ row }) => {
      const count = row.original._count?.studentParents ?? 0
      return h(
        Badge,
        { variant: 'secondary' },
        { default: () => String(count) },
      )
    },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Parent } }) => {
            const item = row.original
            return h(ActionCell, {
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Data Orang Tua?',
              deleteDescription:
                'Data orang tua ini akan dihapus secara permanen dari sistem.',
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(item)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete) return actions.onDelete(item, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
