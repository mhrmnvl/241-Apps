import type { ApiPaginatedResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import { PAGINATION } from '@/shared/constants/pagination'
import type {
  AcademicYearOption,
  CalendarEntry,
  CalendarTypeOption,
} from '../types'

/**
 * The wire shape of a person as `/teachers` and `/students` return it. Only the
 * branches this app reads are typed; everything else in the payload is ignored.
 */
interface PersonResponse {
  nip?: string | null
  user: {
    id: string
    identifier: string
    profile: { name: string }
  }
}

export const lookupApi = {
  getTeachers: () => {
    return api.get<ApiPaginatedResponse<PersonResponse>>('/teachers', {
      params: { isActive: true, limit: PAGINATION.REFERENCE_LIMIT },
    })
  },

  getStudents: () => {
    return api.get<ApiPaginatedResponse<PersonResponse>>('/students', {
      params: { isActive: true, limit: PAGINATION.REFERENCE_LIMIT },
    })
  },

  getAcademicYears: () => {
    return api.get<ApiPaginatedResponse<AcademicYearOption>>(
      '/academic-years',
      { params: { limit: PAGINATION.REFERENCE_LIMIT } },
    )
  },

  getCalendarTypes: () => {
    return api.get<ApiPaginatedResponse<CalendarTypeOption>>(
      '/academic-calendar-types',
      { params: { isActive: true, limit: PAGINATION.REFERENCE_LIMIT } },
    )
  },

  getCalendarEntries: (academicYearId: string, typeId: string) => {
    return api.get<ApiPaginatedResponse<CalendarEntry>>('/academic-calendars', {
      params: {
        academicYearId,
        typeId,
        limit: PAGINATION.CHILD_ENTITY_LIMIT,
      },
    })
  },
}
