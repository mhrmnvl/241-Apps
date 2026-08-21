import type { MyDashboard } from '../types'

export interface DashboardPanel {
  value: 'student' | 'teacher' | 'institution'
  label: string
}

/**
 * Which dashboards a person has, in the order they should meet them.
 *
 * Decided from records and permissions, never from a role name. The two halves
 * of the payload are already the answer: the backend resolved the caller to a
 * student record and a teacher record, so a teacher the school gave an invented
 * role — SARPRAS exists in the live database — still gets a teacher half, and
 * renaming a role changes nothing here. `src/__tests__/no-role-name-branching.spec.ts`
 * is the sweep that holds that line across every feature.
 *
 * It returns a list rather than a choice because holding more than one is
 * ordinary: a wali kelas who also operates the system, a head teacher whose own
 * teaching sits beside the school view.
 *
 * @param dashboard the personal payload, or null when it was never fetched
 *   (no `dashboards.read-own`) or failed to load
 * @param canReadInstitution whether the caller holds `dashboards.read`
 */
export function selectDashboardPanels(
  dashboard: MyDashboard | null,
  canReadInstitution: boolean,
): DashboardPanel[] {
  const panels: DashboardPanel[] = []
  // Own first. Someone who is both a student and staff is here to see their own
  // day; the school view is the wider context, not the headline.
  if (dashboard?.student) panels.push({ value: 'student', label: 'Siswa' })
  if (dashboard?.teacher) panels.push({ value: 'teacher', label: 'Guru' })
  if (canReadInstitution)
    panels.push({ value: 'institution', label: 'Sekolah' })
  return panels
}
