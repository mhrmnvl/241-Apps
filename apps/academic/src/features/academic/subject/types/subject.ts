export interface SubjectTeacherProfile {
  name?: string | null
}

export interface SubjectTeacherUser {
  profile?: SubjectTeacherProfile | null
}

export interface SubjectTeacher {
  id: string
  teacherId?: string
  teacher?: {
    nip?: string
    user?: SubjectTeacherUser
  }
}

export interface Subject {
  id: string
  name: string
  code: string
  teachingAssignments?: SubjectTeacher[]
}
