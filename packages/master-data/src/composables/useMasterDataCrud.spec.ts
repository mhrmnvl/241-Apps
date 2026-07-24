import { describe, expect, it, vi } from 'vitest'
import { useMasterDataCrud } from './useMasterDataCrud'
import type { MasterDataConfig, MasterDataEntity } from '../types/config'

interface FakeEntity extends MasterDataEntity {
  name: string
  isActive: boolean
}

function buildConfig(
  overrides: Partial<MasterDataConfig<FakeEntity>['service']> = {},
): MasterDataConfig<FakeEntity> {
  return {
    entityLabel: { singular: 'Item', plural: 'Items' },
    permissions: { canCreate: true, canUpdate: true, canDelete: true },
    fields: [
      { key: 'name', kind: 'text', label: 'Nama', required: true },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
    service: {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(true),
      update: vi.fn().mockResolvedValue(true),
      remove: vi.fn().mockResolvedValue(true),
      ...overrides,
    },
  }
}

describe('useMasterDataCrud', () => {
  it('fetches the list on demand and tracks loading state', async () => {
    const items: FakeEntity[] = [{ id: '1', name: 'A', isActive: true }]
    const config = buildConfig({ list: vi.fn().mockResolvedValue(items) })
    const crud = useMasterDataCrud(config)

    const promise = crud.fetchAll()
    expect(crud.isLoading.value).toBe(true)
    await promise
    expect(crud.isLoading.value).toBe(false)
    expect(crud.data.value).toEqual(items)
  })

  it('refetches after a successful create, but not after a failed one', async () => {
    const list = vi.fn().mockResolvedValue([])
    const create = vi.fn().mockResolvedValue(true)
    const config = buildConfig({ list, create })
    const crud = useMasterDataCrud(config)

    await crud.create({ name: 'New', isActive: true })
    expect(create).toHaveBeenCalledWith({ name: 'New', isActive: true })
    expect(list).toHaveBeenCalledTimes(1)

    const configWithFailingCreate = buildConfig({
      list,
      create: vi.fn().mockResolvedValue(false),
    })
    const crudWithFailure = useMasterDataCrud(configWithFailingCreate)
    await crudWithFailure.create({ name: 'Nope', isActive: true })
    expect(list).toHaveBeenCalledTimes(1)
  })

  it('calls service.update with the id and payload separately', async () => {
    const update = vi.fn().mockResolvedValue(true)
    const config = buildConfig({ update })
    const crud = useMasterDataCrud(config)

    await crud.update('42', { name: 'Renamed' })
    expect(update).toHaveBeenCalledWith('42', { name: 'Renamed' })
  })

  it('calls service.remove with the item id and the alert callbacks', async () => {
    const remove = vi.fn().mockResolvedValue(true)
    const config = buildConfig({ remove })
    const crud = useMasterDataCrud(config)
    const callbacks = { closeAlert: vi.fn(), setLoading: vi.fn() }

    await crud.remove({ id: '7', name: 'X', isActive: true }, callbacks)
    expect(remove).toHaveBeenCalledWith('7', callbacks)
  })
})
