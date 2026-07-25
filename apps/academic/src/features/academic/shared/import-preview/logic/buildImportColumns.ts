import { h, type VNode } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Switch } from '@/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'
import { cn } from '@/ui/utils'
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import type { ImportColumnDescriptor, ImportPreviewRow } from '../types'
import { formatErrorMessage } from './formatErrorMessage'
import { getFieldErrorDetail } from './getFieldErrorDetail'

const IDENTIFIER_ERROR_ALIASES = ['username', 'identifier', 'identitas']
const PASSWORD_ERROR_ALIASES = ['password', 'kata sandi']

export interface BuildImportColumnsOptions {
  descriptors: ImportColumnDescriptor[]
  actions: Record<number, 'update' | 'skip'>
  loading: boolean
  onActionChange: (row: number, action: 'update' | 'skip') => void
}

/**
 * Assembles the preview table's columns: `row -> identifier -> [descriptor
 * columns] -> password -> actions`. The four fixed columns are engine-owned
 * because no adapter (student, teacher) has ever needed them to vary — only
 * the middle, descriptor-driven columns are entity-specific.
 */
export function buildImportColumns<TData>(
  options: BuildImportColumnsOptions,
): ColumnDef<ImportPreviewRow<TData>>[] {
  const { descriptors, actions, loading, onActionChange } = options

  const dataOf = (row: ImportPreviewRow<TData>) =>
    row.data as Record<string, unknown> | undefined

  const toDisplayText = (value: unknown): string => {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value)
    }
    return '-'
  }

  const renderCellWithError = (
    row: ImportPreviewRow<TData>,
    aliases: string[],
    displayValue: unknown,
  ) => {
    const cleanFullError = formatErrorMessage(row.error, descriptors)
    const isFailed = row.status === 'FAILED'
    const detail = getFieldErrorDetail(aliases, cleanFullError)

    if (!detail) {
      return h('span', { class: 'truncate' }, toDisplayText(displayValue))
    }

    const iconColor = isFailed ? 'text-destructive' : 'text-amber-500'

    if (!displayValue) {
      return h(
        Tooltip,
        {},
        {
          default: () => [
            h(TooltipTrigger, { asChild: true }, () =>
              h('div', { class: 'flex items-center justify-center w-full' }, [
                h(AlertCircle, {
                  class: cn('h-5 w-5 cursor-help shrink-0', iconColor),
                }),
              ]),
            ),
            h(
              TooltipContent,
              { side: 'top', class: 'whitespace-nowrap text-xs z-50' },
              () => detail,
            ),
          ],
        },
      )
    }

    return h('div', { class: 'flex items-center gap-1.5' }, [
      h('span', { class: 'truncate' }, toDisplayText(displayValue)),
      h(
        Tooltip,
        {},
        {
          default: () => [
            h(TooltipTrigger, { asChild: true }, () =>
              h(AlertCircle, {
                class: cn('h-4 w-4 cursor-help shrink-0', iconColor),
              }),
            ),
            h(
              TooltipContent,
              { side: 'top', class: 'whitespace-nowrap text-xs z-50' },
              () => detail,
            ),
          ],
        },
      ),
    ])
  }

  const rowColumn: ColumnDef<ImportPreviewRow<TData>> = {
    accessorKey: 'row',
    header: 'Baris',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.row,
  }

  const identifierColumn: ColumnDef<ImportPreviewRow<TData>> = {
    id: 'identifier',
    header: 'Identifier',
    meta: { align: 'center' },
    cell: ({ row }) =>
      renderCellWithError(
        row.original,
        IDENTIFIER_ERROR_ALIASES,

        dataOf(row.original)?.identifier || row.original.identifier,
      ),
  }

  const dataColumns: ColumnDef<ImportPreviewRow<TData>>[] = descriptors.map(
    (descriptor) => ({
      id: descriptor.key,
      header: descriptor.header,
      meta: { align: descriptor.align },
      cell: ({ row }) => {
        const rawValue = dataOf(row.original)?.[descriptor.key]
        const displayValue =
          descriptor.valueMap && typeof rawValue === 'string'
            ? (descriptor.valueMap[rawValue] ?? rawValue)
            : rawValue
        return renderCellWithError(
          row.original,
          descriptor.errorAliases ?? [descriptor.key],
          displayValue,
        )
      },
    }),
  )

  const passwordColumn: ColumnDef<ImportPreviewRow<TData>> = {
    id: 'password',
    header: 'Kata Sandi',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const val = dataOf(row.original)?.password
      const isNotNew = row.original.status !== 'SUCCESS'

      if (isNotNew && val) {
        return h(
          Tooltip,
          {},
          {
            default: () => [
              h(TooltipTrigger, { asChild: true }, () =>
                h(
                  'div',
                  {
                    class:
                      'flex items-center justify-center w-full gap-1 cursor-help',
                  },
                  [
                    h('span', { class: 'text-muted-foreground' }, '******'),
                    h(AlertTriangle, {
                      class: 'h-4 w-4 text-amber-500 shrink-0',
                    }),
                  ],
                ),
              ),
              h(
                TooltipContent,
                { side: 'top', class: 'whitespace-nowrap text-xs z-50' },
                () => 'Kata Sandi tidak dapat diperbarui',
              ),
            ],
          },
        )
      }

      return renderCellWithError(row.original, PASSWORD_ERROR_ALIASES, val)
    },
  }

  const actionsColumn: ColumnDef<ImportPreviewRow<TData>> = {
    id: 'actions',
    header: 'Ubah',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const r = row.original.row
      const renderTooltip = (triggerNode: VNode, text: string) =>
        h(
          Tooltip,
          {},
          {
            default: () => [
              h(TooltipTrigger, { asChild: true }, () => triggerNode),
              h(
                TooltipContent,
                {
                  side: 'top',
                  class: 'max-w-[280px] text-xs z-50 break-words',
                },
                () => text,
              ),
            ],
          },
        )

      if (row.original.status === 'FAILED') {
        return renderTooltip(
          h(
            'div',
            { class: 'flex items-center justify-center w-full cursor-help' },
            [h(AlertCircle, { class: 'h-5 w-5 text-destructive shrink-0' })],
          ),
          'Tidak akan diimpor',
        )
      }
      if (row.original.status === 'SUCCESS') {
        return renderTooltip(
          h(
            'div',
            { class: 'flex items-center justify-center w-full cursor-help' },
            [h(CheckCircle2, { class: 'h-5 w-5 text-emerald-600 shrink-0' })],
          ),
          'Data baru',
        )
      }

      const isUpdate = actions[r] === 'update'
      const tooltipText = isUpdate ? 'Perbarui' : 'Lewati'

      return h('div', { class: 'flex items-center justify-center' }, [
        renderTooltip(
          h('div', { class: 'flex items-center' }, [
            h(Switch, {
              modelValue: isUpdate,
              disabled: loading,
              'onUpdate:modelValue': (val: boolean) => {
                onActionChange(r, val ? 'update' : 'skip')
              },
            }),
          ]),
          tooltipText,
        ),
      ])
    },
  }

  return [
    rowColumn,
    identifierColumn,
    ...dataColumns,
    passwordColumn,
    actionsColumn,
  ]
}
