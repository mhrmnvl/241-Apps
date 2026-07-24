import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { religionService } from './services/religionService'
import type {
  Religion,
  ReligionCreatePayload,
  ReligionUpdatePayload,
} from './types'

export function useReligionConfig(): MasterDataConfig<Religion> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Agama', plural: 'Agama' },
    permissions: {
      canCreate: can('religions.create'),
      canUpdate: can('religions.update'),
      canDelete: can('religions.delete'),
    },
    service: {
      list: () => religionService.getReligions(),
      create: (payload) =>
        religionService.createReligion(payload as ReligionCreatePayload),
      update: (id, payload) =>
        religionService.updateReligion(id, payload as ReligionUpdatePayload),
      remove: (id, callbacks) => religionService.deleteReligion(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Nama Agama',
        required: true,
        maxLength: 100,
        placeholder: 'Misal: Islam',
      },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
  }
}
