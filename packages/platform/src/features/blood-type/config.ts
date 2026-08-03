import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { bloodTypeService } from './services/bloodTypeService'
import type {
  BloodType,
  BloodTypeCreatePayload,
  BloodTypeUpdatePayload,
} from './types'

export function useBloodTypeConfig(): MasterDataConfig<
  BloodType,
  BloodTypeCreatePayload,
  BloodTypeUpdatePayload
> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Golongan Darah', plural: 'Golongan Darah' },
    permissions: {
      canCreate: can('blood-types.create'),
      canUpdate: can('blood-types.update'),
      canDelete: can('blood-types.delete'),
    },
    service: {
      list: () => bloodTypeService.getBloodTypes(),
      create: (payload) => bloodTypeService.createBloodType(payload),
      update: (id, payload) => bloodTypeService.updateBloodType(id, payload),
      remove: (id, callbacks) =>
        bloodTypeService.deleteBloodType(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Golongan Darah',
        required: true,
        maxLength: 100,
        placeholder: 'Misal: A',
      },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
  }
}
