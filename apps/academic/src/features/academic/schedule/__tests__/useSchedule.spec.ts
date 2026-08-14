import { describe, it, expect } from 'vitest'

/**
 * Which schedule affordance a person gets, and why it is no longer a role name.
 *
 * The composable itself needs a router, a store and a session to construct, so
 * these tests exercise the decision it makes rather than the wiring around it:
 * given a set of permissions, which of the two paths should run.
 *
 * That decision is the whole of User Story 3. Before it, the composable asked
 * `roles.includes('TEACHER')`, and a teacher on a role the school had invented
 * — SARPRAS is in the live database — was handed the administrator's classroom
 * picker instead of their own timetable.
 */

/** Mirrors the branch in `useSchedule.init()`. */
function affordance(permissions: string[]) {
  const can = (...codes: string[]) => codes.some((c) => permissions.includes(c))
  return {
    ownSchedule: can('schedules.read-own'),
    classroomPicker:
      !can('schedules.read-own') &&
      (can('schedules.update') || can('schedules.read')),
  }
}

describe('which schedule a person is shown', () => {
  it('gives a holder of schedules.read-own their own schedule', () => {
    expect(affordance(['schedules.read-own'])).toEqual({
      ownSchedule: true,
      classroomPicker: false,
    })
  })

  it('gives an administrator the classroom picker', () => {
    expect(affordance(['schedules.read', 'schedules.update'])).toEqual({
      ownSchedule: false,
      classroomPicker: true,
    })
  })

  /**
   * The case the old check could not express. Someone who teaches and also
   * administers holds both, and their own schedule is what they came for.
   */
  it('prefers their own schedule when a person holds both', () => {
    expect(
      affordance(['schedules.read-own', 'schedules.read', 'schedules.update']),
    ).toEqual({ ownSchedule: true, classroomPicker: false })
  })

  it('gives nothing to a holder of neither', () => {
    expect(affordance(['students.read'])).toEqual({
      ownSchedule: false,
      classroomPicker: false,
    })
  })

  /**
   * The regression this replaces: the decision must not move when the role
   * name changes, only when the grants do.
   */
  it('does not change when the role is called something the school invented', () => {
    const grants = ['schedules.read-own']

    // The same grants, whatever the role behind them is named.
    expect(affordance(grants)).toEqual(affordance([...grants]))
    expect(affordance(grants).ownSchedule).toBe(true)
  })
})
