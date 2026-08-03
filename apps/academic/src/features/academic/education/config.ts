import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { educationService } from './services/educationService'
import type {
  EducationLevel,
  EducationLevelCreatePayload,
  EducationLevelUpdatePayload,
} from './types'

export function useEducationConfig(): MasterDataConfig<
  EducationLevel,
  EducationLevelCreatePayload,
  EducationLevelUpdatePayload
> {
  const { can } = useRoleGuard()

  return {
    entityLabel: {
      singular: 'Tingkat Pendidikan',
      plural: 'Tingkat Pendidikan',
    },
    permissions: {
      canCreate: can('educations.create'),
      canUpdate: can('educations.update'),
      canDelete: can('educations.delete'),
    },
    service: {
      list: () => educationService.getEducationLevels(),
      create: (payload) => educationService.createEducationLevel(payload),
      update: (id, payload) =>
        educationService.updateEducationLevel(id, payload),
      remove: (id, callbacks) =>
        educationService.deleteEducationLevel(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Tingkat Pendidikan',
        required: true,
        maxLength: 100,
        placeholder: 'Misal: Sarjana (S1)',
      },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
  }
}
