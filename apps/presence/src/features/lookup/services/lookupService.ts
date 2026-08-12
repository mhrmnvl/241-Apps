import { lookupApi } from '../api/lookupApi'
import { useReferenceList } from '@/features/platform/reference-data'
import type {
  AcademicYearOption,
  CalendarEntry,
  CalendarTypeOption,
  PersonOption,
} from '../types'

/**
 * Read-only access to the academic data this app needs but does not own.
 *
 * Presence keys on `userId` and never on Student or Teacher (ADR-0007), so the
 * only thing it wants from academic is a list of people to pick from and the
 * school calendar to import holidays from. Routing that through one service
 * keeps the dependency to a single file: presence-web talks to academic's HTTP
 * API the same way any other client would, rather than reaching into
 * academic-web's feature modules.
 *
 * These functions throw on failure. Every caller already wraps the load in its
 * own try/catch with a view-specific message, so swallowing the error here
 * would only hide it.
 *
 * The four whole-list reads are held for the session. `listEmployees` alone is
 * called from four places — salary assignment, the credential dialog, manual
 * attendance entry and work-pattern assignment — each of which was fetching the
 * entire staff roster over academic's HTTP API every time it opened.
 *
 * `listCalendarEntries` is not held: it is narrowed by year and type, so one
 * key would serve one year's holidays to another.
 */
export const lookupService = {
  /** Staff and teachers — the people who have work patterns and salaries. */
  listEmployees: async (): Promise<PersonOption[]> => {
    return useReferenceList().read('employees', async () => {
      const res = await lookupApi.getTeachers()
      return (res.data?.data ?? []).map((teacher) => ({
        userId: teacher.user.id,
        name: teacher.user.profile.name,
        identifier: teacher.nip ?? teacher.user.identifier,
      }))
    })
  },

  listStudents: async (): Promise<PersonOption[]> => {
    return useReferenceList().read('students', async () => {
      const res = await lookupApi.getStudents()
      return (res.data?.data ?? []).map((student) => ({
        userId: student.user.id,
        name: student.user.profile.name,
        identifier: student.user.identifier,
      }))
    })
  },

  listAcademicYears: async (): Promise<AcademicYearOption[]> => {
    return useReferenceList().read('academicYears', async () => {
      const res = await lookupApi.getAcademicYears()
      return res.data?.data ?? []
    })
  },

  listCalendarTypes: async (): Promise<CalendarTypeOption[]> => {
    return useReferenceList().read('calendarTypes', async () => {
      const res = await lookupApi.getCalendarTypes()
      return res.data?.data ?? []
    })
  },

  listCalendarEntries: async (
    academicYearId: string,
    typeId: string,
  ): Promise<CalendarEntry[]> => {
    const res = await lookupApi.getCalendarEntries(academicYearId, typeId)
    return res.data?.data ?? []
  },
}
