import type { ClassroomEnrollment, AvailableStudent } from '../types'
import { studentEnrollmentApi } from '../api/studentEnrollmentApi'
import { useClassroomStore } from '../stores/classroomStore'
import { studentApi } from '@/features/academic/student'
import type { Student } from '@/features/academic/student'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const classroomEnrollmentService = {
  fetchClassroomEnrollments: async (
    classroomId: string,
    semesterId: string,
  ) => {
    const store = useClassroomStore()
    store.manageLoading = true
    try {
      const res = await studentEnrollmentApi.getEnrollments({
        classroomId,
        semesterId,
        limit: 100,
      })
      const enrollments: ClassroomEnrollment[] = (res.data.data ?? []).map(
        (e) => ({
          id: e.id,
          studentId: e.studentId,
          status: e.status,
          enrolledAt: e.enrolledAt,
          student: {
            id: e.student.id,
            nis: e.student.nis,
            nisn: e.student.nisn,
            user: {
              profile: {
                name: e.student.user.profile.name,
                gender: e.student.user.profile.gender,
              },
            },
          },
        }),
      )
      store.classroomEnrollments = [...enrollments].sort((a, b) =>
        a.student.user.profile.name.localeCompare(b.student.user.profile.name),
      )
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data siswa terdaftar.'),
      )
    } finally {
      store.manageLoading = false
    }
  },

  fetchAvailableStudents: async (_classroomId: string, semesterId: string) => {
    const store = useClassroomStore()
    try {
      const studentsRes = await studentApi.getStudents({
        limit: 100,
        isActive: true,
      })

      const students: Student[] = studentsRes.data.data ?? []

      const available: AvailableStudent[] = students
        .filter((s) => {
          const enrollments = s.enrollments ?? []
          return !enrollments.some((e) => e.semesterId === semesterId)
        })
        .map((s) => ({
          id: s.id,
          nis: s.nis,
          nisn: s.nisn,
          classroomLevelId: s.classroomLevelId ?? null,
          user: {
            profile: {
              name: s.user.profile.name,
              gender: s.user.profile.gender,
            },
          },
        }))

      store.availableStudents = available
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data siswa tersedia.'),
      )
    }
  },

  bulkEnrollToClassroom: async (
    classroomId: string,
    semesterId: string,
    studentIds: string[],
  ) => {
    const store = useClassroomStore()
    store.enrolling = true
    try {
      const enrollments = studentIds.map((studentId) => ({
        studentId,
        classroomId,
        semesterId,
      }))
      const res = await studentEnrollmentApi.bulkCreateEnrollments({
        enrollments,
      })
      const data = res.data.data

      if (data.created > 0) {
        toast.success(`${data.created} siswa berhasil didaftarkan ke kelas.`)
      }
      if (data.skipped > 0) {
        toast.warning(`${data.skipped} siswa dilewati karena sudah terdaftar.`)
      }

      await Promise.all([
        classroomEnrollmentService.fetchClassroomEnrollments(
          classroomId,
          semesterId,
        ),
        classroomEnrollmentService.fetchAvailableStudents(
          classroomId,
          semesterId,
        ),
      ])
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mendaftarkan siswa.'))
      return { success: false }
    } finally {
      store.enrolling = false
    }
  },

  unenrollStudents: async (
    enrollmentIds: string[],
    classroomId: string,
    semesterId: string,
  ) => {
    try {
      for (const enrollmentId of enrollmentIds) {
        await studentEnrollmentApi.deleteEnrollment(enrollmentId)
      }
      toast.success('Siswa berhasil dikeluarkan dari kelas.')

      await Promise.all([
        classroomEnrollmentService.fetchClassroomEnrollments(
          classroomId,
          semesterId,
        ),
        classroomEnrollmentService.fetchAvailableStudents(
          classroomId,
          semesterId,
        ),
      ])
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengeluarkan siswa.'))
      return { success: false }
    }
  },

  transferStudent: async (
    enrollmentId: string,
    targetClassroomId: string,
    note?: string,
  ) => {
    const store = useClassroomStore()
    store.transferring = true
    try {
      await studentEnrollmentApi.transferStudent(enrollmentId, {
        targetClassroomId,
        note,
      })
      toast.success('Siswa berhasil dipindahkan ke kelas baru.')
      return { success: true }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memindahkan siswa.'))
      return { success: false }
    } finally {
      store.transferring = false
    }
  },

  bulkTransferStudents: async (
    enrollmentIds: string[],
    targetClassroomId: string,
    note?: string,
  ) => {
    const store = useClassroomStore()
    store.transferring = true
    try {
      const res = await studentEnrollmentApi.bulkTransferStudents({
        enrollmentIds,
        targetClassroomId,
        note,
      })
      const data = res.data.data
      const successCount = data.successCount ?? enrollmentIds.length
      const failCount = data.failCount ?? 0

      if (successCount > 0) {
        toast.success(
          `${successCount} siswa berhasil dipindahkan ke kelas baru.`,
        )
      }
      if (failCount > 0) {
        toast.error(`${failCount} siswa gagal dipindahkan.`)
      }

      return { success: successCount > 0, successCount, failCount }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memindahkan siswa.'))
      return {
        success: false,
        successCount: 0,
        failCount: enrollmentIds.length,
      }
    } finally {
      store.transferring = false
    }
  },

  transferOrBulkTransfer: async (
    enrollmentIds: string[],
    targetClassroomId: string,
    note?: string,
  ) => {
    if (enrollmentIds.length === 1) {
      return classroomEnrollmentService.transferStudent(
        enrollmentIds[0]!,
        targetClassroomId,
        note,
      )
    } else {
      return classroomEnrollmentService.bulkTransferStudents(
        enrollmentIds,
        targetClassroomId,
        note,
      )
    }
  },
}
