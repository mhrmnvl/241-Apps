import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { academicCalendarTypeService } from './services/academicCalendarTypeService'
import type {
  AcademicCalendarType,
  AcademicCalendarTypeCreatePayload,
} from './types'

export function useAcademicCalendarTypeConfig(): MasterDataConfig<AcademicCalendarType> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Tipe Kalender', plural: 'Tipe Kalender' },
    permissions: {
      canCreate: can('academic-calendar-types.create'),
      canUpdate: can('academic-calendar-types.update'),
      canDelete: can('academic-calendar-types.delete'),
    },
    service: {
      list: () => academicCalendarTypeService.getAcademicCalendarTypes(),
      create: (payload) =>
        academicCalendarTypeService.createAcademicCalendarType(
          payload as unknown as AcademicCalendarTypeCreatePayload,
        ),
      update: (id, payload) =>
        academicCalendarTypeService.updateAcademicCalendarType(id, payload),
      remove: (id, callbacks) =>
        academicCalendarTypeService.deleteAcademicCalendarType(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Tipe Kalender',
        required: true,
        maxLength: 100,
        placeholder: 'Misal: Libur Nasional',
      },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
  }
}
