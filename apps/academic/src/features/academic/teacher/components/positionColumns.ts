import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@/ui'
import type { TeacherPosition } from '../types'

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const createPositionColumns = (
  isAdmin: boolean,
  handlers: {
    onEdit: (item: TeacherPosition) => void
    onDelete: (
      id: string,
      setLoading: (v: boolean) => void,
      closeAlert: () => void,
    ) => void
  },
): ColumnDef<TeacherPosition>[] => {
  const base: ColumnDef<TeacherPosition>[] = [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'position.name',
      header: 'Nama Jabatan',
      cell: ({ row }) => row.original.position?.name || '-',
    },
    {
      accessorKey: 'position.category',
      header: 'Kategori',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const cat = row.original.position?.category
        const code = cat?.code
        const labelMap: Record<string, string> = {
          MANAGEMENT: 'Pimpinan',
          FINANCE: 'Keuangan',
          ADMIN: 'Tata Usaha',
          ACADEMIC: 'Akademik',
        }
        return (code && labelMap[code]) ?? (cat?.name || '-')
      },
    },
    {
      accessorKey: 'hireDate',
      header: 'Mulai Menjabat',
      meta: { align: 'center' },
      cell: ({ row }) => formatDate(row.original.hireDate),
    },
    {
      accessorKey: 'isPrimary',
      header: 'Tipe',
      meta: { align: 'center' },
      cell: ({ row }) => (row.original.isPrimary ? 'Utama' : 'Tambahan'),
    },
  ]

  if (isAdmin) {
    base.push({
      id: 'actions',
      header: 'Opsi',
      cell: ({ row }) => {
        const item = row.original
        return h(ActionCell, {
          deleteTitle: 'Hapus Jabatan?',
          deleteDescription: `Jabatan "${item.position?.name}" akan dihapus dari pegawai ini.`,
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
    })
  }

  return base
}
