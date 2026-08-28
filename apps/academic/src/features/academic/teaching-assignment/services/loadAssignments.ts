import { teachingAssignmentApi } from '../api/teachingAssignmentApi'
import type {
  TeachingAssignment,
  TeachingAssignmentQueryParams,
} from '../types'
import { useRoleGuard } from '@/features/platform/auth'

export interface LoadedAssignments {
  rows: TeachingAssignment[]
  total: number
}

/**
 * The assignments this person may work with, their own teaching first.
 *
 * No permission can answer "is there a me who teaches" on its own. A teacher
 * holds `.read-own`; whoever assigns the teaching holds `.read`; and
 * `useRoleGuard` grants a SUPER_ADMIN every permission by design, so `.read-own`
 * says yes for somebody who has no teacher record at all. Asked on permission
 * alone, a super admin was sent to fetch "my teaching", got nothing, and the
 * screen came back empty.
 *
 * So the question is answered by asking rather than by guessing: look for my
 * own teaching, and fall through to the school's only when I have none and am
 * allowed to see it. A teacher gets their own classes; an administrator gets
 * everything; a teacher with no assignments yet gets the empty answer that is
 * true for them.
 */
export async function loadAssignments(
  query: TeachingAssignmentQueryParams,
): Promise<LoadedAssignments> {
  const { can } = useRoleGuard()
  const maySeeEveryone = can('teaching-assignments.read')

  if (can('teaching-assignments.read-own')) {
    try {
      const mine = await teachingAssignmentApi.getMyTeachingAssignments(query)
      const rows = mine.data?.data ?? []
      if (rows.length > 0 || !maySeeEveryone) {
        return { rows, total: mine.data?.meta?.total ?? rows.length }
      }
    } catch {
      // A caller with no teacher record can be refused here. That is not the
      // end of the question if they may ask the wider one.
      if (!maySeeEveryone) throw new Error('Tidak ada jadwal mengajar.')
    }
  }

  if (!maySeeEveryone) return { rows: [], total: 0 }

  const all = await teachingAssignmentApi.getTeachingAssignments(query)
  const rows = all.data?.data ?? []
  return { rows, total: all.data?.meta?.total ?? rows.length }
}
