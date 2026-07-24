import { describe, expect, it, vi } from 'vitest'
import { buildColumns } from './buildColumns'
import type { MasterDataConfig, MasterDataEntity } from '../types/config'

interface FakeEntity extends MasterDataEntity {
  name: string
  isActive: boolean
}

function buildConfig(
  permissions: MasterDataConfig<FakeEntity>['permissions'],
): MasterDataConfig<FakeEntity> {
  return {
    entityLabel: { singular: 'Item', plural: 'Items' },
    permissions,
    fields: [
      { key: 'name', kind: 'text', label: 'Nama', required: true },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
    service: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  }
}

describe('buildColumns', () => {
  it('emits one column per field plus an actions column when a permission allows it', () => {
    const config = buildConfig({
      canCreate: true,
      canUpdate: true,
      canDelete: false,
    })
    const columns = buildColumns(config, vi.fn(), vi.fn())

    expect(columns.map((c) => c.header)).toEqual(['Nama', 'Status', 'Opsi'])
  })

  it('omits the actions column entirely when neither update nor delete is allowed', () => {
    const config = buildConfig({
      canCreate: true,
      canUpdate: false,
      canDelete: false,
    })
    const columns = buildColumns(config, vi.fn(), vi.fn())

    expect(columns.map((c) => c.header)).toEqual(['Nama', 'Status'])
  })

  it('renders the boolean field as a badge using the field label defaults', () => {
    const config = buildConfig({
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    })
    const columns = buildColumns(config, vi.fn(), vi.fn())
    const statusColumn = columns.find((c) => c.header === 'Status')!
    const vnode = (
      statusColumn.cell as (ctx: { row: { original: FakeEntity } }) => {
        props: { variant: string }
        children: () => string
      }
    )({ row: { original: { id: '1', name: 'A', isActive: false } } })

    expect(vnode.props.variant).toBe('outline')
    expect(vnode.children()).toBe('Tidak Aktif')
  })
})
