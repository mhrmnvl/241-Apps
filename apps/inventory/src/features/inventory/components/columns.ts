import type { InventoryAsset } from '../types'
import { ActionCell, Badge } from '@/ui'
import { Checkbox } from '@/ui/checkbox'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

export interface AssetColumnActions {
  onEdit: (asset: InventoryAsset) => void
  onDelete: (
    asset: InventoryAsset,
    callbacks: { closeAlert: () => void; setLoading: (v: boolean) => void },
  ) => void | Promise<void>
  showActions?: boolean
  /** Adds a row-selection checkbox column (used by the label-printing page). */
  selectable?: boolean
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
  ...(actions.selectable
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
              modelValue: table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? 'indeterminate'
                  : false,
              'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
                table.toggleAllPageRowsSelected(value === true),
              ariaLabel: 'Pilih semua',
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
              modelValue: row.getIsSelected(),
              'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
                row.toggleSelected(value === true),
              ariaLabel: 'Pilih baris',
            }),
          enableSorting: false,
          enableHiding: false,
        },
      ]
    : []),
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
    id: 'unitCount',
    header: 'Jumlah Unit',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.units?.length ?? 0,
    accessorFn: (row) => row.units?.length ?? 0,
  },
  {
    id: 'available',
    header: 'Tersedia',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const units = row.original.units ?? []
      const avail = units.filter((u) => u.status?.code === 'STAT-AVAIL').length
      return h(
        Badge,
        { variant: avail > 0 ? 'default' : 'secondary' },
        () => `${avail}/${units.length}`,
      )
    },
  },
  {
    id: 'purchasePrice',
    header: 'Harga / Unit',
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
