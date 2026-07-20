import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@/ui'
import type { Scholarship, ScholarshipColumnActions } from '../types'

export const createScholarshipColumns = (
  isAdmin: boolean,
  handlers: ScholarshipColumnActions,
): ColumnDef<Scholarship>[] => {
  const baseColumns: ColumnDef<Scholarship>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Program Beasiswa',
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'provider',
      header: 'Instansi / Penyelenggara',
      cell: ({ row }) => row.original.provider || '-',
    },
    {
      accessorKey: 'year',
      header: 'Tahun',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.year || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.status || '-',
    },
  ]

  const actionColumn: ColumnDef<Scholarship> = {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      const item = row.original
      return h(ActionCell, {
        deleteTitle: 'Hapus Beasiswa?',
        deleteDescription: 'Data beasiswa ini akan dihapus secara permanen.',
        onEdit: () => handlers.onEdit(item),
        onDelete: ({
          closeAlert,
          setLoading,
        }: {
          closeAlert: () => void
          setLoading: (v: boolean) => void
        }) => {
          handlers.onDelete(item.id, setLoading, closeAlert)
        },
      })
    },
  }

  return isAdmin ? [...baseColumns, actionColumn] : baseColumns
}
