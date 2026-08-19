import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * The roster is not a self-service read, and must never become one by accident.
 *
 * `GET /students` answers about the school: every student, for whoever holds
 * `students.read`. It is not narrowed for anyone — a student reaches their own
 * record through `GET /students/me`, on `students.read-own`, which the student
 * role holds instead of the wide code.
 *
 * The failure this guards against is small and quiet: adding `students.read-own`
 * to the roster route, reasoning that a student "should be able to read
 * students". They would then receive all of them. The route was already
 * reachable that way once — it took `@CurrentUser() _user`, ignored it, and the
 * seed granted the student role `students.read`.
 *
 * Verified live on the dev box against a seeded student: `GET /students`
 * answers 403.
 */
describe('the student roster stays a management read', () => {
  const CONTROLLER = join(
    process.cwd(),
    'src',
    'academic',
    'student',
    'presentation',
    'student.controller.ts',
  );

  let source: string;

  beforeAll(async () => {
    source = await readFile(CONTROLLER, 'utf8');
  });

  /**
   * The whole file no longer excludes `students.read-own` — `GET me` is
   * guarded by it, which is the point. What must stay excluded is the roster,
   * so the assertion moved from the file to the route.
   */
  it('never guards the roster with students.read-own', () => {
    const rosterStart = source.indexOf('@Get()');
    const rosterEnd = source.indexOf("@Get('me')");
    expect(rosterEnd).toBeGreaterThan(rosterStart);

    expect(source.slice(rosterStart, rosterEnd)).not.toContain(
      'students.read-own',
    );
  });

  it('keeps the roster on students.read', () => {
    // The bare `@Get()` immediately preceded by the management permission.
    expect(source).toMatch(
      /@Get\(\)\s*@RequirePermissions\('students\.read'\)/,
    );
  });

  /**
   * `me` before `:id`, or Nest parses the literal as a uuid and rejects it —
   * the self-service route would 400 for everyone and look like a broken
   * account rather than a misordered file.
   */
  it('declares the self-service route before its :id sibling', () => {
    const me = source.indexOf("@Get('me')");
    const byId = source.indexOf("@Get(':id')");

    expect(me).toBeGreaterThan(-1);
    expect(byId).toBeGreaterThan(me);
  });

  it('guards the self-service route with students.read-own', () => {
    expect(source).toMatch(
      /@Get\('me'\)\s*@RequirePermissions\('students\.read-own'\)/,
    );
  });

  it('does not take a caller on the roster route', () => {
    // Bounded by `me` rather than `:id`: the self-service route now sits
    // between them and does take a caller, which is correct there and would
    // otherwise be read as the roster taking one.
    const rosterStart = source.indexOf('@Get()');
    const rosterEnd = source.indexOf("@Get('me')");
    const roster = source.slice(rosterStart, rosterEnd);

    // Not narrowed for anyone, so it has no business knowing who is asking —
    // and a caller it asks for and ignores is what hid the original defect.
    expect(roster).not.toContain('@CurrentUser()');
  });

  it('still passes the caller to the single-student read, which does narrow', () => {
    const detailStart = source.indexOf("@Get(':id')");
    const detail = source.slice(detailStart, detailStart + 600);

    expect(detail).toContain('@CurrentUser()');
    expect(detail).toContain('reqUser');
  });
});
