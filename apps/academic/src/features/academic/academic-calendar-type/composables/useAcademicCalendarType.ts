import { academicCalendarTypeService } from '../services/academicCalendarTypeService'

export function useAcademicCalendarType() {
  return {
    getAcademicCalendarTypes:
      academicCalendarTypeService.getAcademicCalendarTypes,
  }
}
