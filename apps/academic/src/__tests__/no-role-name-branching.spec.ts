import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { glob } from 'node:fs/promises'
import { describe, it, expect, beforeAll } from 'vitest'

/**
 * No feature decides what to show by comparing a role to a literal.
 *
 * `useRoleGuard` states the reason in its own doc comment and deliberately
 * offers no `isTeacher`/`isStudent`: "custom roles (assigned arbitrary
 * permission sets) would silently fail any role-name check". The schedule
 * feature built the check anyway, and the failure was exactly as predicted —
 * a teacher holding a role the school invented was shown the administrator's
 * classroom picker instead of their own timetable. This school does invent
 * them: SARPRAS exists in the live database.
 *
 * Two role-name checks are sanctioned, and both are named here rather than
 * excluded by pattern, so adding a third is a deliberate edit to this file:
 *
 *   - the router's SUPER_ADMIN bypass, which is the break-glass path
 *   - `menuConfig`'s `allowedRoles`, which chooses a menu section rather than
 *     an authorization outcome
 *
 * Anything else asks `can(...)` instead.
 */

const FEATURES = join(process.cwd(), 'src', 'features')

/** `roles.includes('TEACHER')`, `userRoles.includes('STUDENT')`, and friends. */
const ROLE_LITERAL_CHECK = /\broles(?:\.value)?\??\.includes\(\s*'([A-Z_]+)'/g

function code(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

/**
 * Files allowed to name a role, with the reason. Paths are matched by suffix
 * so the list reads as filenames rather than as machine paths.
 */
const SANCTIONED = [
  // The menu picks a section by audience; it authorises nothing.
  'config/menuConfig.ts',

  // The profile decides which *sections* a person's own profile has — a
  // student has parents and an educational history, an employee has
  // employment data. That is the shape of a record rather than a permission,
  // so it is not the defect this sweep was built for.
  //
  // It is listed rather than excused: the honest signal here is also the
  // record, not the role. `profileData` already carries `student` and
  // `teacher` objects from the profile endpoint, so these could ask whether
  // the person *has* a student record instead of whether their role is called
  // STUDENT — and a school that names its student role something else would
  // then still see the right tabs. That is a change to the profile feature,
  // with its own blast radius on which fields a person sees, and it is not
  // this feature's to make.
  'profile/setup.ts',
  'profile/components/SchoolIdentityTab.vue',
  'educational-history/components/EducationalHistoryTab.vue',
]

describe('no screen decides what to show from a role name', () => {
  let files: { path: string; text: string }[]

  beforeAll(async () => {
    const found: { path: string; text: string }[] = []
    for await (const entry of glob('**/*.{ts,vue}', { cwd: FEATURES })) {
      if (entry.includes('__tests__') || entry.endsWith('.spec.ts')) continue
      found.push({
        path: entry.replace(/\\/g, '/'),
        text: code(await readFile(join(FEATURES, entry), 'utf8')),
      })
    }
    files = found
  })

  it('finds the academic features', () => {
    expect(files.length).toBeGreaterThan(100)
  })

  it('never compares a role to a literal', () => {
    const offenders = files
      .filter((f) => !SANCTIONED.some((s) => f.path.endsWith(s)))
      .filter((f) => new RegExp(ROLE_LITERAL_CHECK.source, 'g').test(f.text))
      .map((f) => f.path)
      .sort()

    expect(offenders).toEqual([])
  })

  /**
   * Guards the guard: a pattern that matches nothing would pass the assertion
   * above while checking nothing, so assert it still fires on the exact shape
   * the schedule composable carried until this feature removed it.
   */
  it('recognises the shape it is looking for', () => {
    const branching = `const isTeacher = computed(() => roles.value.includes('TEACHER'))`
    const permission = `const isAdmin = computed(() => can('schedules.update'))`

    expect(new RegExp(ROLE_LITERAL_CHECK.source).test(branching)).toBe(true)
    expect(new RegExp(ROLE_LITERAL_CHECK.source).test(permission)).toBe(false)
  })
})
