import type { InventoryAsset } from '../types'
import { ActionCell, Badge } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

export interface AssetColumnActions {
  onEdit: (asset: InventoryAsset) => void
  onDelete: (
    asset: InventoryAsset,
    callbacks: { closeAlert: () => void; setLoading: (v: boolean) => void },
  ) => void | Promise<void>
  showActions?: boolean
}

function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

export const createColumns = (
  actions: AssetColumnActions,
): ColumnDef<InventoryAsset>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'assetNumber',
    header: 'No. Aset',
    cell: ({ row }) => row.original.assetNumber,
    accessorKey: 'assetNumber',
  },
  {
    id: 'name',
    header: 'Nama Aset',
    cell: ({ row }) => row.original.name,
    accessorKey: 'name',
  },
  {
    id: 'category',
    header: 'Kategori',
    cell: ({ row }) => row.original.category?.name ?? '-',
    accessorFn: (row) => row.category?.name,
  },
  {
    id: 'location',
    header: 'Lokasi',
    cell: ({ row }) => {
      const loc = row.original.location
      return loc ? `${loc.name} (${loc.building ?? ''})` : '-'
    },
    accessorFn: (row) => row.location?.name,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      if (!status) return '-'

      // Determine badge variant based on status code
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
        'outline'
      if (status.code === 'STAT-AVAIL') variant = 'default'
      else if (status.code === 'STAT-LOANED') variant = 'secondary'
      else if (status.code === 'STAT-MAINT') variant = 'outline'
      else if (status.code === 'STAT-LOST') variant = 'destructive'

      return h(Badge, { variant }, () => status.name)
    },
    accessorFn: (row) => row.status?.name,
  },
  {
    id: 'condition',
    header: 'Kondisi',
    cell: ({ row }) => {
      const cond = row.original.condition
      if (!cond) return '-'
      const variant = cond.isUsable ? 'outline' : 'destructive'
      return h(Badge, { variant }, () => cond.name)
    },
    accessorFn: (row) => row.condition?.name,
  },
  {
    id: 'purchasePrice',
    header: 'Nilai Aset',
    cell: ({ row }) => formatIDR(Number(row.original.purchasePrice)),
    accessorKey: 'purchasePrice',
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: InventoryAsset } }) => {
            const asset = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Aset?',
              deleteDescription: `Apakah Anda yakin ingin menghapus data aset "${asset.name}" (${asset.assetNumber})? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => {
                actions.onEdit(asset)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                void actions.onDelete(asset, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
