export function useCalendarFormat() {
  const padZero = (num: number) => num.toString().padStart(2, '0')

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${padZero(d.getHours())}:${padZero(d.getMinutes())}`
  }

  const formatDateStr = (dateStr: string) => {
    const d = new Date(dateStr)
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ]
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  /**
   * "22 Agustus 2026" — the same date `formatDateStr` shortens, spelled out.
   *
   * For a detail view, where there is room and only one date to read. An
   * unparseable value is returned as it came rather than as "Invalid Date":
   * showing the raw string at least says what the server sent.
   */
  const formatLongDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  /**
   * The clock hours of an entry, read off the string rather than through `Date`.
   *
   * The API sends them as an instant on the epoch — `1970-01-01T08:00:00.000Z`
   * — because the column is a `time`, not a timestamp. Reading that with
   * `getHours()` applies the viewer's timezone and turns 08:00 into 15:00 in
   * Jakarta. The characters at 11..16 are the wall-clock time the school
   * actually entered.
   */
  const formatClock = (value?: string | null) =>
    value ? value.slice(11, 16) : null

  /**
   * "08:00 – 12:00", or null when the entry has no hours.
   *
   * Most entries have none: a term runs July to December and a holiday is the
   * 17th, and neither has a clock time. Only an activity does. Both or neither
   * is enforced on write, so one half present means the data predates that rule.
   */
  const formatHourRange = (
    startTime?: string | null,
    endTime?: string | null,
  ) => {
    const start = formatClock(startTime)
    const end = formatClock(endTime)
    if (!start || !end) return null
    return `${start} – ${end}`
  }

  const formatEventType = (type: string) => {
    const map: Record<string, string> = {
      SEMESTER_START: 'Awal Semester',
      SEMESTER_END: 'Akhir Semester',
      EXAM_MID: 'UTS',
      EXAM_FINAL: 'UAS',
      REGISTRATION: 'Registrasi',
      HOLIDAY_NATIONAL: 'Libur Nasional',
      HOLIDAY_WEEKLY: 'Libur Mingguan',
      HOLIDAY_SCHOOL: 'Libur Sekolah',
      STUDY: 'KBM',
    }
    return map[type] ?? 'Kegiatan'
  }

  return {
    formatTime,
    formatClock,
    formatHourRange,
    formatDateStr,
    formatLongDate,
    formatEventType,
  }
}
