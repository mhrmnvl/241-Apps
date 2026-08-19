/**
 * What the rest of `academic/` sees of a student account: whether the person
 * signing in has a student record, and which one. Nothing else.
 *
 * Four modules need this — report cards, scores, attendance and schedules all
 * have to answer "whose data is this request about" before they can answer
 * anything else. Without a shared port each would resolve it its own way, and
 * the one that got it wrong would be the one nobody looked at.
 *
 * The answer is a record, never a role. `get-student-by-id.use-case.ts` already
 * works this way, and it is what survives a school inventing its own roles —
 * which this one has: `SARPRAS` exists in the dev database. A role name says
 * who someone is called; a student record says whose marks these are.
 *
 * Null means the caller has no student record, and the caller must treat that
 * as an empty result. It must never widen into an unscoped read: that is the
 * failure this whole boundary exists to prevent, and it is silent, because an
 * unscoped list of report cards looks exactly like a correct one.
 */
export abstract class IStudentIdentityReadPort {
  abstract findStudentIdByUserId(userId: string): Promise<string | null>;
}
