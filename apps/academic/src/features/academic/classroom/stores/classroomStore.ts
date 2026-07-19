import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  Classroom,
  ClassroomSupervisorAssignment,
  ClassroomEnrollment,
  AvailableStudent,
  Curricula,
  AcademicYear,
  TeacherOption,
  Semester,
  ClassroomStructure,
  ClassroomLevel,
} from '../types'

export const useClassroomStore = defineStore('classroom', () => {
  const classrooms = ref<Classroom[]>([])
  const classroomLevels = ref<ClassroomLevel[]>([])
  const curricula = ref<Curricula[]>([])
  const academicYears = ref<AcademicYear[]>([])
  const teachers = ref<TeacherOption[]>([])
  const semesters = ref<Semester[]>([])
  const classroomSupervisorAssignments = ref<ClassroomSupervisorAssignment[]>(
    [],
  )
  const totalClassrooms = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const isSupervisorSaving = ref(false)
  const formError = ref<string | null>(null)
  const supervisorFormError = ref<string | null>(null)

  const currentClassroom = ref<Classroom | null>(null)
  const classroomEnrollments = ref<ClassroomEnrollment[]>([])
  const availableStudents = ref<AvailableStudent[]>([])
  const classroomStructure = ref<ClassroomStructure | null>(null)
  const enrolling = ref(false)
  const transferring = ref(false)
  const manageLoading = ref(false)

  return {
    classrooms,
    classroomLevels,
    curricula,
    academicYears,
    teachers,
    semesters,
    classroomSupervisorAssignments,
    totalClassrooms,
    loading,
    isSaving,
    isSupervisorSaving,
    formError,
    supervisorFormError,
    currentClassroom,
    classroomEnrollments,
    availableStudents,
    classroomStructure,
    enrolling,
    transferring,
    manageLoading,
  }
})
