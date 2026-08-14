import type { PaginationMeta } from '@/shared/types/api'

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

/**
 * One subject's line, frozen when the rapor was generated.
 *
 * These are stored values, not a live calculation — a published rapor keeps
 * the pass mark and predicate it was issued with even after the school revises
 * them. `passingScore` is what the backend calls it; "KKM" is the label the
 * teacher reads, which is why the translation lives here and not there.
 */
export interface RaporSubject {
  subjectId: string
  subjectCode: string | null
  subjectName: string
  score: number
  passingScore: number
  predicate: string
  description: string
  isComplete: boolean
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
  subjects?: RaporSubject[]
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

/**
 * The summary cards, computed by the backend over the whole filtered set.
 *
 * This used to be worked out here, from `rapors` — which holds one page. A
 * class of 32 shown ten at a time reported "Total Siswa: 10" and averaged those
 * ten, and both numbers changed as you paged. Neither looks wrong on screen,
 * which is why it stayed.
 *
 * `averageScore` is null when nothing in the set has been generated yet, so the
 * card can show "-" rather than a zero nobody scored.
 */
export interface RaporSummary {
  published: number
  draft: number
  averageScore: number | null
}

export interface RaporListMeta extends PaginationMeta {
  summary?: RaporSummary
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
  /** Active enrolments considered in the classroom. */
  total: number
  generated: number
  /** Left alone because their rapor is already published. */
  skipped: number
  skippedEnrollmentIds: string[]
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
