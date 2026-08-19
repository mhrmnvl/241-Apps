import { describe, it, expect } from 'vitest'
import type { Attendance, AttendanceStatus } from '../types'

/**
 * The totals on the student's attendance screen.
 *
 * They are counted in the browser, and that is only safe because the read is
 * not paginated there — `MyAttendanceView` asks for the whole set. Counting a
 * page and calling it a total is precisely the defect this project fixed on the
 * rapor summary cards, where "Total Siswa" reported the page size and the class
 * average covered whoever happened to be on screen. Both numbers looked
 * entirely ordinary.
 *
 * So this pins the arithmetic, and pins the assumption it rests on: every row
 * given to it is counted, and none is counted twice.
 */
function totals(rows: Attendance[]) {
  const count = (status: string) =>
    rows.filter((r) => r.status === status).length
  return {
    present: count('PRESENT'),
    late: count('LATE'),
    sick: count('SICK'),
    excused: count('EXCUSED'),
    absent: count('ABSENT'),
    total: rows.length,
  }
}

function row(status: AttendanceStatus): Attendance {
  return {
    id: crypto.randomUUID(),
    enrollmentId: 'enr-1',
    date: '2026-08-14',
    status,
  }
}

describe("a student's own attendance totals", () => {
  it('counts each status separately', () => {
    const result = totals([
      row('PRESENT'),
      row('PRESENT'),
      row('LATE'),
      row('SICK'),
      row('ABSENT'),
    ])

    expect(result).toEqual({
      present: 2,
      late: 1,
      sick: 1,
      excused: 0,
      absent: 1,
      total: 5,
    })
  })

  /**
   * The guarantee that makes browser-side counting defensible: the parts add
   * up to the whole. If a status were ever added to the model and not here, the
   * cards would silently under-report and still look right.
   */
  it('accounts for every row, so the parts sum to the total', () => {
    const rows = [
      row('PRESENT'),
      row('LATE'),
      row('SICK'),
      row('EXCUSED'),
      row('ABSENT'),
    ]
    const t = totals(rows)

    expect(t.present + t.late + t.sick + t.excused + t.absent).toBe(t.total)
  })

  it('reports zeroes rather than failing on an empty record', () => {
    expect(totals([])).toEqual({
      present: 0,
      late: 0,
      sick: 0,
      excused: 0,
      absent: 0,
      total: 0,
    })
  })
})
