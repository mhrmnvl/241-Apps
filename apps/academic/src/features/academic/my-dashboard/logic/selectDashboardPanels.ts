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
 * `dashboards.read` settles it on its own: whoever may read the school's
 * figures came here for the school's figures, and gets that one screen with no
 * tab strip over it. Administrator accounts are routinely attached to a staff
 * record, so without this rule an operator who also teaches would meet two tabs
 * on every sign-in and have to pick the same one every time. The cost is that a
 * head teacher holding `dashboards.read` no longer sees their own teaching
 * here; their timetable and marking stay on the screens that own them.
 *
 * It still returns a list rather than a single panel, because being both a
 * student and a teacher is possible and costs nothing to carry.
 *
 * @param dashboard the personal payload, or null when it was never fetched
 *   (no `dashboards.read-own`) or failed to load
 * @param canReadInstitution whether the caller holds `dashboards.read`
 */
export function selectDashboardPanels(
  dashboard: MyDashboard | null,
  canReadInstitution: boolean,
): DashboardPanel[] {
  if (canReadInstitution) return [{ value: 'institution', label: 'Sekolah' }]

  const panels: DashboardPanel[] = []
  if (dashboard?.student) panels.push({ value: 'student', label: 'Siswa' })
  if (dashboard?.teacher) panels.push({ value: 'teacher', label: 'Guru' })
  return panels
}
