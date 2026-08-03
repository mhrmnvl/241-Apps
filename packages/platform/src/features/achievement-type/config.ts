import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { achievementTypeService } from './services/achievementTypeService'
import type {
  AchievementType,
  AchievementTypeCreatePayload,
  AchievementTypeUpdatePayload,
} from './types'

export function useAchievementTypeConfig(): MasterDataConfig<
  AchievementType,
  AchievementTypeCreatePayload,
  AchievementTypeUpdatePayload
> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Tingkat Prestasi', plural: 'Tingkat Prestasi' },
    permissions: {
      canCreate: can('achievement-types.create'),
      canUpdate: can('achievement-types.update'),
      canDelete: can('achievement-types.delete'),
    },
    service: {
      list: () => achievementTypeService.getAchievementTypes(),
      create: (payload) =>
        achievementTypeService.createAchievementType(payload),
      update: (id, payload) =>
        achievementTypeService.updateAchievementType(id, payload),
      remove: (id, callbacks) =>
        achievementTypeService.deleteAchievementType(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Tingkat Prestasi',
        required: true,
        maxLength: 100,
        placeholder: 'Misal: Nasional',
      },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
  }
}
