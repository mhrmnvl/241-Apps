export interface RaporEnrollment {
  student: {
    id: string
    nis: string
    nisn: string
    user: {
      profile: {
        name: string
      } | null
    }
  }
  classroom: {
    id: string
    name: string
    displayName: string
    gradeId: string
    classroomLevelId?: string
  }
  semester: {
    id: string
    type: string
    academicYear?: {
      name: string
    }
  }
}

export interface RaporData {
  id: string
  enrollmentId: string
  totalAverage: number | null
  rank: number | null
  teacherNote: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
  enrollment: RaporEnrollment
}

export interface RaporDetailData extends RaporData {
  attendance: {
    SICK: number
    EXCUSED: number
    ABSENT: number
  }
}

export interface RaporQueryParams {
  page?: number
  limit?: number
  studentId?: string
  classroomId?: string
  semesterId?: string
  isPublished?: boolean
}

export interface GenerateRaporPayload {
  enrollmentId: string
  teacherNote?: string
  rank?: number
  isPublished?: boolean
}

export interface BulkGeneratePayload {
  classroomId: string
  semesterId: string
}

export interface BulkGenerateResult {
  generated: number
  totalStudents: number
  rapors: RaporData[]
}

export interface UpdateRaporPayload {
  teacherNote?: string
  rank?: number
  isPublished?: boolean
}

export interface RaporScoreRow {
  subject: string
  type: string
  score: number | null
  weight: number
}
