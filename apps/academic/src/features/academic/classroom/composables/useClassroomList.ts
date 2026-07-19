import { storeToRefs } from 'pinia'
import { classroomService } from '../services/classroomService'
import { classroomReferenceService } from '../services/classroomReferenceService'
import { useClassroomStore } from '../stores/classroomStore'

export function useClassroomList() {
  const store = useClassroomStore()
  const {
    classrooms,
    classroomLevels,
    curricula,
    academicYears,
    semesters,
    totalClassrooms,
    loading,
  } = storeToRefs(store)

  return {
    classrooms,
    classroomLevels,
    curricula,
    academicYears,
    semesters,
    totalClassrooms,
    loading,
    fetchClassrooms: classroomService.fetchClassrooms,
    fetchCurricula: classroomReferenceService.fetchCurricula,
    fetchAcademicYears: classroomReferenceService.fetchAcademicYears,
    fetchClassroomLevels: classroomReferenceService.fetchClassroomLevels,
    fetchSemesters: classroomReferenceService.fetchSemesters,
    deleteClassroom: classroomService.deleteClassroom,
  }
}
