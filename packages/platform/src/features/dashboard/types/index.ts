export interface DashboardStatistics {
  totalStudents: number
  totalTeachers: number
  totalInstructors: number
  totalClasses: number
  totalSubjects: number
}

export interface DashboardAcademicInfo {
  activeAcademicYear: { id: string; name: string } | null
  activeSemester: { id: string; type: string } | null
}

export interface DashboardInstitution {
  name: string
  status: string
  type: string
}

export interface StudentByGrade {
  grade: string
  totalStudents: number
}

export interface TeacherByPosition {
  category: string
  total: number
}

export interface DashboardDistributions {
  studentsByGrade: StudentByGrade[]
  teachersByPosition: TeacherByPosition[]
}

export interface DashboardEvent {
  id: string
  title: string
  type: string
  startDate: string
  endDate: string
}

export interface DashboardAnnouncement {
  id: string
  title: string
  date: string
}

export interface DashboardSummary {
  statistics: DashboardStatistics
  academicInfo: DashboardAcademicInfo
  institution: DashboardInstitution | null
  distributions: DashboardDistributions
  upcomingEvents: DashboardEvent[]
  recentAnnouncements: DashboardAnnouncement[]
}
