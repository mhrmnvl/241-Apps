import { storeToRefs } from 'pinia'
import { classroomService } from '../services/classroomService'
import { classroomEnrollmentService } from '../services/classroomEnrollmentService'
import { useClassroomStore } from '../stores/classroomStore'

export function useClassroomEnrollment() {
  const store = useClassroomStore()
  const {
    currentClassroom,
    classroomEnrollments,
    availableStudents,
    enrolling,
    transferring,
    manageLoading,
  } = storeToRefs(store)

  return {
    currentClassroom,
    classroomEnrollments,
    availableStudents,
    enrolling,
    transferring,
    manageLoading,
    fetchClassroomDetail: classroomService.fetchClassroomDetail,
    fetchClassroomEnrollments:
      classroomEnrollmentService.fetchClassroomEnrollments,
    fetchAvailableStudents: classroomEnrollmentService.fetchAvailableStudents,
    bulkEnrollToClassroom: classroomEnrollmentService.bulkEnrollToClassroom,
    unenrollStudents: classroomEnrollmentService.unenrollStudents,
    transferStudent: classroomEnrollmentService.transferStudent,
    bulkTransferStudents: classroomEnrollmentService.bulkTransferStudents,
    transferOrBulkTransfer: classroomEnrollmentService.transferOrBulkTransfer,
  }
}
