import { storeToRefs } from 'pinia'
import { classroomService } from '../services/classroomService'
import { classroomReferenceService } from '../services/classroomReferenceService'
import { useClassroomStore } from '../stores/classroomStore'

export function useClassroomList() {
  const store = useClassroomStore()
  const {
    classrooms,
    grades,
    academicYears,
    semesters,
    totalClassrooms,
    loading,
  } = storeToRefs(store)

  return {
    classrooms,
    grades,
    academicYears,
    semesters,
    totalClassrooms,
    loading,
    fetchClassrooms: classroomService.fetchClassrooms,
    fetchAcademicYears: classroomReferenceService.fetchAcademicYears,
    fetchGrades: classroomReferenceService.fetchGrades,
    fetchSemesters: classroomReferenceService.fetchSemesters,
    deleteClassroom: classroomService.deleteClassroom,
  }
}
