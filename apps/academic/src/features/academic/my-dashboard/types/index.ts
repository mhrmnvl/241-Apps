/**
 * The shape of `GET /dashboards/me`.
 *
 * Both halves are nullable and that is the whole design: null means the signed-in
 * person has no such record, so the screen never has to ask what role they hold.
 * A teacher with nothing to teach today still has a `teacher` half — with an
 * empty `todayLessons` — which is a different thing from not being a teacher.
 */

export interface MyDashboardClassroom {
  id: string
  code: string
  name: string | null
}

export interface MyDashboardLesson {
  id: string
  /** `HH:mm`, already in school time — see the backend's `clock()`. */
  startTime: string
  endTime: string
  subjectName: string
  /** The class being taught. Present on a teacher's row. */
  classroomCode: string | null
  /** Who takes the lesson. Present on a student's row. */
  teacherName: string | null
  room: string | null
}

export interface MyDashboardAttendance {
  present: number
  absent: number
  late: number
  excused: number
  sick: number
}

export interface MyDashboardScore {
  id: string
  subjectName: string
  assessmentName: string
  score: number | null
  maxScore: number
}

export interface MyDashboardReportCard {
  id: string
  semesterName: string
}

export interface MyDashboardTeachingLoad {
  classroomCount: number
  subjectCount: number
}

export interface MyDashboardSupervisedClassroom extends MyDashboardClassroom {
  studentCount: number
}

export interface MyDashboardUngradedAssessment {
  id: string
  name: string
  subjectName: string
  classroomCode: string
  gradedCount: number
  studentCount: number
}

export interface MyStudentDashboard {
  /** Null between years, when no enrolment exists for the active semester. */
  classroom: MyDashboardClassroom | null
  todayLessons: MyDashboardLesson[]
  attendance: MyDashboardAttendance
  latestScores: MyDashboardScore[]
  latestReportCard: MyDashboardReportCard | null
}

export interface MyTeacherDashboard {
  todayLessons: MyDashboardLesson[]
  load: MyDashboardTeachingLoad
  supervisedClassrooms: MyDashboardSupervisedClassroom[]
  ungradedAssessments: MyDashboardUngradedAssessment[]
  /** The total, so five rows shown never read as five outstanding. */
  ungradedTotal: number
}

export interface MyDashboard {
  semester: { id: string; name: string } | null
  today: { date: string; isWeeklyHoliday: boolean }
  student: MyStudentDashboard | null
  teacher: MyTeacherDashboard | null
}
