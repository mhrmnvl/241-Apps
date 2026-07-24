import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { positionCategoryService } from './services/positionCategoryService'
import type {
  PositionCategory,
  PositionCategoryCreatePayload,
  PositionCategoryUpdatePayload,
} from './types'

export function usePositionCategoryConfig(): MasterDataConfig<PositionCategory> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Kategori Jabatan', plural: 'Kategori Jabatan' },
    permissions: {
      canCreate: can('positions.create'),
      canUpdate: can('positions.update'),
      canDelete: can('positions.delete'),
    },
    service: {
      list: () => positionCategoryService.getPositionCategories(),
      create: (payload) =>
        positionCategoryService.createPositionCategory(
          payload as unknown as PositionCategoryCreatePayload,
        ),
      update: (id, payload) =>
        positionCategoryService.updatePositionCategory(
          id,
          payload as unknown as PositionCategoryUpdatePayload,
        ),
      remove: (id, callbacks) =>
        positionCategoryService.deletePositionCategory(id, callbacks),
    },
    fields: [
      {
        key: 'code',
        kind: 'text',
        label: 'Kode Kategori',
        required: true,
        maxLength: 30,
        placeholder: 'Misal: MANAGEMENT',
        readOnlyOnEdit: true,
      },
      {
        key: 'name',
        kind: 'text',
        label: 'Nama Kategori',
        required: true,
        maxLength: 100,
        placeholder: 'Misal: Management',
      },
    ],
  }
}
