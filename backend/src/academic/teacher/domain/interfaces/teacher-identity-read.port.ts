/**
 * Whether the person signing in has a teaching record, and which one.
 *
 * The counterpart to `IStudentIdentityReadPort`, and it exists for the same
 * reason: `GET /schedules/me` has to know whose schedule to answer with before
 * it can answer at all, and the honest signal is the record rather than the
 * role.
 *
 * That distinction is the point. academic-web decided this by comparing the
 * user's roles to the literal `TEACHER`, so a teacher the school had given a
 * role of its own making — `SARPRAS`, `Guru Honorer`, `Wali Kelas` — was shown
 * the administrator's classroom picker instead of their own timetable. A
 * teaching record does not care what the role is called.
 *
 * Null means no teaching record: an empty schedule, never someone else's.
 */
export abstract class ITeacherIdentityReadPort {
  abstract findTeacherIdByUserId(userId: string): Promise<string | null>;
}
