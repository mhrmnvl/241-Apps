import { ActionCell, Badge } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type {
  MasterDataConfig,
  MasterDataDeleteCallbacks,
  MasterDataEntity,
} from '../types/config'

export function buildColumns<T extends MasterDataEntity>(
  config: MasterDataConfig<T>,
  onEdit: (item: T) => void,
  onDelete: (item: T, callbacks: MasterDataDeleteCallbacks) => void,
): ColumnDef<T>[] {
  const fieldColumns: ColumnDef<T>[] = config.fields.map((field) => {
    if (field.kind === 'boolean') {
      return {
        accessorKey: field.key,
        header: field.label,
        meta: { align: 'center' },
        cell: ({ row }) => {
          const value = Boolean(
            (row.original as Record<string, unknown>)[field.key],
          )
          return h(Badge, { variant: value ? 'default' : 'outline' }, () =>
            value
              ? (field.trueLabel ?? 'Aktif')
              : (field.falseLabel ?? 'Tidak Aktif'),
          )
        },
      }
    }

    return {
      accessorKey: field.key,
      header: field.label,
      meta: { align: 'left' },
    }
  })

  const showActions =
    config.permissions.canUpdate || config.permissions.canDelete

  if (!showActions) return fieldColumns

  return [
    ...fieldColumns,
    {
      id: 'actions',
      header: 'Opsi',
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original
        const nameLike = String(
          config.fields.find((f) => f.kind === 'text')
            ? (item as Record<string, unknown>)[
                config.fields.find((f) => f.kind === 'text')!.key
              ]
            : '',
        )
        return h(ActionCell, {
          hideEdit: !config.permissions.canUpdate,
          hideDelete: !config.permissions.canDelete,
          deleteTitle: `Hapus ${config.entityLabel.singular}?`,
          deleteDescription: `Yakin ingin menghapus ${config.entityLabel.singular.toLowerCase()} "${nameLike}"? Tindakan ini tidak dapat dibatalkan.`,
          onEdit: () => onEdit(item),
          onDelete: (callbacks: MasterDataDeleteCallbacks) =>
            onDelete(item, callbacks),
        })
      },
    },
  ]
}
