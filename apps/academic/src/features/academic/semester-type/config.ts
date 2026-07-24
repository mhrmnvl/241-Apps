import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { semesterTypeService } from './services/semesterTypeService'
import type {
  SemesterType,
  SemesterTypeCreatePayload,
  SemesterTypeUpdatePayload,
} from './types'

export function useSemesterTypeConfig(): MasterDataConfig<SemesterType> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Tipe Semester', plural: 'Tipe Semester' },
    permissions: {
      canCreate: can('semesters.create'),
      canUpdate: can('semesters.update'),
      canDelete: can('semesters.delete'),
    },
    service: {
      list: () => semesterTypeService.getSemesterTypes(),
      create: (payload) =>
        semesterTypeService.createSemesterType(
          payload as unknown as SemesterTypeCreatePayload,
        ),
      update: (id, payload) =>
        semesterTypeService.updateSemesterType(
          id,
          payload as unknown as SemesterTypeUpdatePayload,
        ),
      remove: (id, callbacks) =>
        semesterTypeService.deleteSemesterType(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Tipe Semester',
        required: true,
        maxLength: 50,
        placeholder: 'Misal: ODD',
      },
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
  }
}
