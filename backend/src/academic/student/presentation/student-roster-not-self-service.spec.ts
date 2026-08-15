import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * The roster is not a self-service read, and must never become one by accident.
 *
 * `GET /students` answers about the school: every student, for whoever holds
 * `students.read`. It is not narrowed for anyone — a student reaches their own
 * record through `GET /students/:id`, which does check who is asking, and after
 * this feature the student role holds `students.read-own` instead.
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

  it('never guards a route with students.read-own', () => {
    expect(source).not.toContain("'students.read-own'");
  });

  it('keeps the roster on students.read', () => {
    // The bare `@Get()` immediately preceded by the management permission.
    expect(source).toMatch(
      /@Get\(\)\s*@RequirePermissions\('students\.read'\)/,
    );
  });

  it('does not take a caller on the roster route', () => {
    const rosterStart = source.indexOf('@Get()');
    const rosterEnd = source.indexOf("@Get(':id')");
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
