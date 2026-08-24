export interface SemesterTypeRef {
  id: string
  name: 'ODD' | 'EVEN'
}

export interface AcademicYearRef {
  id: string
  name: string
  /**
   * The calendar year this school year opens in.
   *
   * What the promotion screen orders by to find the year after the active
   * one. Never the name: years are master data the school renames, and a
   * rename would move a whole cohort into the wrong year in silence.
   */
  startYear?: number
  isActive?: boolean
}

export interface Semester {
  id: string
  academicYearId: string
  typeId: string
  type: SemesterTypeRef
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  academicYear?: AcademicYearRef

  /**
   * What the term already holds, counted by the server.
   *
   * A term with no enrolments has not been rolled over yet — which is a state
   * worth noticing rather than a state to discover later, when a screen looks
   * broken because the data was never copied into it.
   */
  _count?: {
    enrollments: number
    teachingAssignments: number
  }
}
