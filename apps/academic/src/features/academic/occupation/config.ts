import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { occupationService } from './services/occupationService'
import type {
  Occupation,
  OccupationCreatePayload,
  OccupationUpdatePayload,
} from './types'

export function useOccupationConfig(): MasterDataConfig<Occupation> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Pekerjaan', plural: 'Pekerjaan' },
    permissions: {
      canCreate: can('occupations.create'),
      canUpdate: can('occupations.update'),
      canDelete: can('occupations.delete'),
    },
    service: {
      list: () => occupationService.getOccupations(),
      create: (payload) =>
        occupationService.createOccupation(
          payload as unknown as OccupationCreatePayload,
        ),
      update: (id, payload) =>
        occupationService.updateOccupation(
          id,
          payload as unknown as OccupationUpdatePayload,
        ),
      remove: (id, callbacks) =>
        occupationService.deleteOccupation(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Nama Pekerjaan',
        required: true,
        placeholder: 'Misal: Pegawai Negeri Sipil',
      },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
  }
}
