import type { InventoryAssetUnit } from '../types'
import { Checkbox } from '@/ui/checkbox'
import { Button } from '@/ui/button'
import type { ColumnDef } from '@tanstack/vue-table'
import { Pencil, Printer, Trash2 } from 'lucide-vue-next'
import { h } from 'vue'

export interface UnitColumnActions {
  onPrint: (unit: InventoryAssetUnit) => void
  onEdit: (unit: InventoryAssetUnit) => void
  onDelete: (unit: InventoryAssetUnit) => void
  isSaving: boolean
  canDelete: boolean
}

export const createUnitColumns = (
  actions: UnitColumnActions,
): ColumnDef<InventoryAssetUnit>[] => [
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
        ariaLabel: 'Pilih semua unit',
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
        ariaLabel: 'Pilih unit',
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'unitNumber',
    header: 'No. Unit',
    cell: ({ row }) =>
      h('span', { class: 'font-mono' }, row.original.unitNumber),
    accessorKey: 'unitNumber',
  },
  {
    id: 'condition',
    header: 'Kondisi',
    cell: ({ row }) => row.original.condition?.name ?? '-',
    accessorFn: (row) => row.condition?.name,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => row.original.status?.name ?? '-',
    accessorFn: (row) => row.status?.name,
  },
  {
    id: 'location',
    header: 'Lokasi',
    cell: ({ row }) => row.original.location?.name ?? '-',
    accessorFn: (row) => row.location?.name,
  },
  {
    id: 'actions',
    header: 'Aksi',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const unit = row.original
      return h('div', { class: 'flex items-center justify-center gap-1' }, [
        h(
          Button,
          {
            size: 'icon',
            variant: 'ghost',
            class: 'h-8 w-8',
            onClick: () => actions.onPrint(unit),
          },
          () => h(Printer, { class: 'size-4' }),
        ),
        h(
          Button,
          {
            size: 'icon',
            variant: 'ghost',
            class: 'h-8 w-8',
            disabled: actions.isSaving,
            onClick: () => actions.onEdit(unit),
          },
          () => h(Pencil, { class: 'size-4' }),
        ),
        h(
          Button,
          {
            size: 'icon',
            variant: 'ghost',
            class: 'text-destructive hover:text-destructive h-8 w-8',
            disabled: actions.isSaving || !actions.canDelete,
            onClick: () => actions.onDelete(unit),
          },
          () => h(Trash2, { class: 'size-4' }),
        ),
      ])
    },
    enableSorting: false,
    enableHiding: false,
  },
]
