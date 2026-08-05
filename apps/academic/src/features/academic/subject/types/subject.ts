export interface SubjectTeacherProfile {
  name?: string | null
}

export interface SubjectTeacherUser {
  profile?: SubjectTeacherProfile | null
}

export interface SubjectClassroom {
  id: string
  name?: string | null
}

/**
 * One teacher assigned to this subject in one classroom, for the active
 * semester. A subject can carry several of these with different teachers —
 * IPA may be taught by one teacher in VII-A and another in VIII-A.
 */
export interface SubjectTeachingAssignment {
  id: string
  teacherId: string
  classroom?: SubjectClassroom | null
  teacher?: {
    nip?: string | null
    user?: SubjectTeacherUser | null
  } | null
}

export interface Subject {
  id: string
  name: string
  code: string
  teachingAssignments?: SubjectTeachingAssignment[]
}
