import { lookupApi } from '../api/lookupApi'
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
 */
export const lookupService = {
  /** Staff and teachers — the people who have work patterns and salaries. */
  listEmployees: async (): Promise<PersonOption[]> => {
    const res = await lookupApi.getTeachers()
    return (res.data?.data ?? []).map((teacher) => ({
      userId: teacher.user.id,
      name: teacher.user.profile.name,
      identifier: teacher.nip ?? teacher.user.identifier,
    }))
  },

  listStudents: async (): Promise<PersonOption[]> => {
    const res = await lookupApi.getStudents()
    return (res.data?.data ?? []).map((student) => ({
      userId: student.user.id,
      name: student.user.profile.name,
      identifier: student.user.identifier,
    }))
  },

  listAcademicYears: async (): Promise<AcademicYearOption[]> => {
    const res = await lookupApi.getAcademicYears()
    return res.data?.data ?? []
  },

  listCalendarTypes: async (): Promise<CalendarTypeOption[]> => {
    const res = await lookupApi.getCalendarTypes()
    return res.data?.data ?? []
  },

  listCalendarEntries: async (
    academicYearId: string,
    typeId: string,
  ): Promise<CalendarEntry[]> => {
    const res = await lookupApi.getCalendarEntries(academicYearId, typeId)
    return res.data?.data ?? []
  },
}
