/**
 * What the class filter holds when it means "every class".
 *
 * A sentinel rather than an empty string because the select rejects `''` as an
 * item value outright — and rather than `null` because the filter has to have
 * something selected to show a label.
 *
 * It is a screen-level value and must never reach the server: `classroomId` is
 * validated as a UUID there, so sending this produced a 400 and an error toast
 * on a page that had merely been asked to show everything. Whoever builds the
 * query is responsible for dropping it, which is what `isEveryClassroom` is
 * for.
 */
export const EVERY_CLASSROOM = '__all__'

export function isEveryClassroom(value: string | null | undefined): boolean {
  return !value || value === EVERY_CLASSROOM
}
