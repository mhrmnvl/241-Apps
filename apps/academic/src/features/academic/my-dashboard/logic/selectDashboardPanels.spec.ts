import { describe, expect, it } from 'vitest'
import { selectDashboardPanels } from './selectDashboardPanels'
import type {
  MyDashboard,
  MyStudentDashboard,
  MyTeacherDashboard,
} from '../types'

const studentHalf: MyStudentDashboard = {
  classroom: { id: 'c1', code: 'VIII-A', name: null },
  todayLessons: [],
  attendance: { present: 0, absent: 0, late: 0, excused: 0, sick: 0 },
  latestScores: [],
  latestReportCard: null,
}

const teacherHalf: MyTeacherDashboard = {
  todayLessons: [],
  load: { classroomCount: 0, subjectCount: 0 },
  supervisedClassrooms: [],
  ungradedAssessments: [],
  ungradedTotal: 0,
}

function payload(
  student: MyStudentDashboard | null,
  teacher: MyTeacherDashboard | null,
): MyDashboard {
  return {
    semester: { id: 's1', name: 'Ganjil' },
    today: { date: '2026-08-21', isWeeklyHoliday: false },
    student,
    teacher,
  }
}

const values = (panels: { value: string }[]) => panels.map((p) => p.value)

describe('selectDashboardPanels', () => {
  it('gives a student their own dashboard and nothing else', () => {
    const panels = selectDashboardPanels(payload(studentHalf, null), false)
    expect(values(panels)).toEqual(['student'])
  })

  it('gives a teacher their own dashboard and nothing else', () => {
    const panels = selectDashboardPanels(payload(null, teacherHalf), false)
    expect(values(panels)).toEqual(['teacher'])
  })

  it('gives both to someone who both teaches and studies', () => {
    const panels = selectDashboardPanels(
      payload(studentHalf, teacherHalf),
      false,
    )
    expect(values(panels)).toEqual(['student', 'teacher'])
  })

  /**
   * A head teacher still teaches. Showing them only the school totals would
   * hide their own timetable and the marking they owe.
   */
  it('puts a teacher who may also read the school on their own day first', () => {
    const panels = selectDashboardPanels(payload(null, teacherHalf), true)
    expect(values(panels)).toEqual(['teacher', 'institution'])
  })

  it('gives an administrator with no records the school dashboard', () => {
    const panels = selectDashboardPanels(payload(null, null), true)
    expect(values(panels)).toEqual(['institution'])
  })

  /**
   * The empty case is real and must not throw: an operator account holding
   * neither permission lands here, because `/dashboard` is where the router
   * sends everyone it turns away.
   */
  it('gives nothing to someone with neither a record nor the permission', () => {
    expect(selectDashboardPanels(payload(null, null), false)).toEqual([])
  })

  it('treats a payload that never loaded as no personal dashboard', () => {
    // Null covers both "no `dashboards.read-own`, so never fetched" and "the
    // fetch failed" — in either case the school view must still be offered.
    expect(values(selectDashboardPanels(null, true))).toEqual(['institution'])
    expect(selectDashboardPanels(null, false)).toEqual([])
  })

  /**
   * The point of the whole design, asserted directly: what a person sees comes
   * from their records, so a school-invented role name cannot change it.
   */
  it('does not depend on what the role is called', () => {
    const asSarpras = selectDashboardPanels(payload(null, teacherHalf), false)
    const asTeacher = selectDashboardPanels(payload(null, teacherHalf), false)
    expect(asSarpras).toEqual(asTeacher)
  })
})
