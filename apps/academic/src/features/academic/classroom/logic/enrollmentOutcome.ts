import type { EnrollmentStatus } from '../types'

export interface EnrollmentOutcome {
  /** What the school calls this, on screen. */
  label: string
  /** Badge variant; `outline` for the year in progress. */
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  /**
   * Whether a note on this row is the reason for a decision rather than an
   * incidental remark — which decides whether it is shown in red.
   */
  noteIsAReason: boolean
}

const OUTCOMES: Record<EnrollmentStatus, EnrollmentOutcome> = {
  ACTIVE: {
    label: 'Sedang Berjalan',
    variant: 'outline',
    noteIsAReason: false,
  },
  PROMOTED: { label: 'Naik Kelas', variant: 'default', noteIsAReason: false },
  REPEATED: {
    label: 'Tinggal Kelas',
    variant: 'destructive',
    noteIsAReason: true,
  },
  TRANSFERRED: {
    label: 'Pindah Kelas',
    variant: 'secondary',
    noteIsAReason: false,
  },
  DROPPED: { label: 'Keluar', variant: 'destructive', noteIsAReason: true },
  GRADUATED: { label: 'Lulus', variant: 'secondary', noteIsAReason: false },
}

/**
 * How a year ended for a student, in words the school uses.
 *
 * A table rather than a switch so a status the server adds shows up as a
 * missing key here rather than as a silent fall-through to "unknown" — and so
 * the mapping can be read in one glance beside the statuses it covers.
 *
 * An unrecognised status is shown as itself. The alternative is a dash, which
 * would hide a real outcome behind something that reads like missing data.
 */
export function enrollmentOutcome(status: string): EnrollmentOutcome {
  return (
    OUTCOMES[status as EnrollmentStatus] ?? {
      label: status,
      variant: 'outline',
      noteIsAReason: false,
    }
  )
}
