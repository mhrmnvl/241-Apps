import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { schoolUnitTypeService } from './services/schoolUnitTypeService'
import type {
  SchoolUnitType,
  SchoolUnitTypeCreatePayload,
  SchoolUnitTypeUpdatePayload,
} from './types'

export function useSchoolUnitTypeConfig(): MasterDataConfig<SchoolUnitType> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Tipe Sekolah', plural: 'Tipe Sekolah' },
    permissions: {
      canCreate: can('school-units.create'),
      canUpdate: can('school-units.update'),
      canDelete: can('school-units.delete'),
    },
    service: {
      list: () => schoolUnitTypeService.getSchoolUnitTypes(),
      create: (payload) =>
        schoolUnitTypeService.createSchoolUnitType(
          payload as unknown as SchoolUnitTypeCreatePayload,
        ),
      update: (id, payload) =>
        schoolUnitTypeService.updateSchoolUnitType(
          id,
          payload as unknown as SchoolUnitTypeUpdatePayload,
        ),
      remove: (id, callbacks) =>
        schoolUnitTypeService.deleteSchoolUnitType(id, callbacks),
    },
    fields: [
      {
        key: 'code',
        kind: 'text',
        label: 'Kode Tipe Sekolah',
        required: true,
        maxLength: 20,
        placeholder: 'Misal: SMA, SMK',
        readOnlyOnEdit: true,
      },
      {
        key: 'name',
        kind: 'text',
        label: 'Nama Tipe Sekolah',
        required: true,
        maxLength: 100,
        placeholder: 'Misal: Sekolah Menengah Atas',
      },
      {
        key: 'isActive',
        kind: 'boolean',
        label: 'Status',
        default: true,
        falseLabel: 'Nonaktif',
      },
    ],
  }
}
