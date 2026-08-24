export type EnrollmentStatus =
  'ACTIVE' | 'PROMOTED' | 'REPEATED' | 'TRANSFERRED' | 'DROPPED' | 'GRADUATED'

export interface ClassroomEnrollment {
  id: string
  studentId: string
  status: string
  enrolledAt: string
  student: {
    id: string
    nis: string
    nisn: string
    user: {
      profile: {
        name: string
        gender: string | null
      }
    }
  }
}

export interface AvailableStudent {
  id: string
  nis: string
  nisn: string
  gradeId: string | null
  classroomLevelId?: string | null
  user: {
    profile: {
      name: string
      gender: string | null
    }
  }
}

export interface StudentWithEnrollments {
  id: string
  nis: string
  nisn: string
  gradeId: string | null
  classroomLevelId?: string | null
  enrollments: { semesterId: string }[]
  user: { profile: { name: string; gender: string } }
}

export interface EnrollmentStudent {
  id: string
  nis: string
  nisn: string
  gradeId: string | null
  classroomLevelId?: string | null
  user: {
    profile: {
      name: string
      gender: string | null
    }
  }
}

export interface EnrollmentClassroom {
  id: string
  name: string | null
  displayName: string
  gradeId: string
  classroomLevelId?: string
  capacity: number
}

export interface EnrollmentSemester {
  id: string
  type: {
    id: string
    name: string
  }
  isActive: boolean
  academicYear: {
    id: string
    name: string
  }
}

export interface StudentEnrollment {
  id: string
  studentId: string
  classroomId: string
  semesterId: string
  status: EnrollmentStatus
  enrolledAt: string
  endedAt: string | null
  note: string | null
  student: EnrollmentStudent
  classroom: EnrollmentClassroom
  semester: EnrollmentSemester
  rapor: { id: string } | null
}
