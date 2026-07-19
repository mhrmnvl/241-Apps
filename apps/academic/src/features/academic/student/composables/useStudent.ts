import { storeToRefs } from 'pinia'
import { useStudentStore } from '../stores/studentStore'
import { studentService } from '../services/studentService'

export function useStudent() {
  const store = useStudentStore()
  const refs = storeToRefs(store)

  return {
    ...refs,

    fetchStudents: studentService.fetchStudents,
    fetchClassrooms: studentService.fetchClassrooms,
    fetchClassroomLevels: studentService.fetchClassroomLevels,
    saveStudent: studentService.saveStudent,
    deleteStudent: studentService.deleteStudent,
    toggleActive: studentService.toggleActive,
    exportStudents: studentService.exportStudents,
    getImportTemplate: studentService.getImportTemplate,
    bulkImport: studentService.bulkImport,
    updateStudentAccount: studentService.updateStudentAccount,
    updateStudentCredentials: studentService.updateStudentCredentials,
  }
}
