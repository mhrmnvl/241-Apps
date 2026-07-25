import { describe, it, expect, vi } from 'vitest'
import { buildImportColumns } from './buildImportColumns'
import type { ImportColumnDescriptor, ImportPreviewRow } from '../types'

interface Row {
  name: string
  gender?: string
}

const descriptors: ImportColumnDescriptor[] = [
  { key: 'name', header: 'Nama', align: 'left', messageLabel: 'nama' },
  {
    key: 'gender',
    header: 'Jenis Kelamin',
    align: 'left',
    errorAliases: ['gender', 'jenis kelamin'],
    messageLabel: 'jenis kelamin',
    valueMap: { MALE: 'Laki-laki', FEMALE: 'Perempuan' },
  },
]

function columnId(column: {
  id?: string
  accessorKey?: string
}): string | undefined {
  return column.id ?? column.accessorKey
}

function cellOf(
  columns: ReturnType<typeof buildImportColumns<Row>>,
  id: string,
) {
  const column = columns.find((c) => columnId(c) === id)!
  return column.cell as (ctx: {
    row: { original: ImportPreviewRow<Row> }
  }) => unknown
}

describe('buildImportColumns', () => {
  it('orders columns as row -> identifier -> data columns -> password -> actions', () => {
    const columns = buildImportColumns<Row>({
      descriptors,
      actions: {},
      loading: false,
      onActionChange: vi.fn(),
    })

    expect(columns.map(columnId)).toEqual([
      'row',
      'identifier',
      'name',
      'gender',
      'password',
      'actions',
    ])
  })

  it('renders plain text for a data column with no error', () => {
    const columns = buildImportColumns<Row>({
      descriptors,
      actions: {},
      loading: false,
      onActionChange: vi.fn(),
    })
    const vnode = cellOf(
      columns,
      'name',
    )({
      row: { original: { row: 1, status: 'SUCCESS', data: { name: 'Budi' } } },
    }) as { children: string }

    expect(vnode.children).toBe('Budi')
  })

  it('translates a value through valueMap before rendering', () => {
    const columns = buildImportColumns<Row>({
      descriptors,
      actions: {},
      loading: false,
      onActionChange: vi.fn(),
    })
    const vnode = cellOf(
      columns,
      'gender',
    )({
      row: {
        original: {
          row: 1,
          status: 'SUCCESS',
          data: { name: 'Budi', gender: 'MALE' },
        },
      },
    }) as { children: string }

    expect(vnode.children).toBe('Laki-laki')
  })

  it('shows an error tooltip (not plain text) for a column matched by its aliases', () => {
    const columns = buildImportColumns<Row>({
      descriptors,
      actions: {},
      loading: false,
      onActionChange: vi.fn(),
    })
    const vnode = cellOf(
      columns,
      'gender',
    )({
      row: {
        original: {
          row: 1,
          status: 'FAILED',
          error: 'gender must be one of the following values: MALE, FEMALE',
          data: { name: 'Budi' },
        },
      },
    }) as { children: unknown }

    // Plain-text cells render a string `children`; error cells render a
    // Tooltip vnode tree (an object/array), never a bare string.
    expect(typeof vnode.children).not.toBe('string')
  })

  it('ignores a column whose aliases do not match the error text', () => {
    const columns = buildImportColumns<Row>({
      descriptors,
      actions: {},
      loading: false,
      onActionChange: vi.fn(),
    })
    const vnode = cellOf(
      columns,
      'name',
    )({
      row: {
        original: {
          row: 1,
          status: 'FAILED',
          error: 'gender must be one of the following values: MALE, FEMALE',
          data: { name: 'Budi' },
        },
      },
    }) as { children: string }

    expect(vnode.children).toBe('Budi')
  })

  it('masks the password of a non-SUCCESS row instead of showing its value', () => {
    interface WithPassword {
      password: string
    }
    const columns = buildImportColumns<WithPassword>({
      descriptors: [],
      actions: {},
      loading: false,
      onActionChange: vi.fn(),
    })
    const cell = cellOf(
      columns as unknown as ReturnType<typeof buildImportColumns<Row>>,
      'password',
    )
    const vnode = cell({
      row: {
        original: {
          row: 1,
          status: 'CONFLICT',
          existingId: 'id-1',
          data: { password: 'secret' } as unknown as Row,
        },
      },
    }) as { children: unknown }

    expect(typeof vnode.children).not.toBe('string')
  })
})
