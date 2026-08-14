import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * A controller may not ask for the caller and then ignore them.
 *
 * This is the shape the exposure had. `GET /rapors`, `GET /academic/attendances`
 * and `GET /students` each declared `@CurrentUser()` and passed only the query
 * to the use case, so the read answered about the whole school no matter who
 * asked — and the student role held the permission to make those calls. A
 * student opening their own menu received every student's report card.
 *
 * The parameter is what made it invisible. Sitting in the signature, it reads
 * as though identity was considered. Two of the three were even named `_user`,
 * which records that ignoring it was a decision rather than an oversight, and a
 * reader skims past a decision.
 *
 * So the rule is syntactic and absolute: if a route does not use the caller, it
 * must not ask for them. A route about the school takes no caller and says so
 * by its absence; a route about a person takes one and uses it. There is no
 * third state, and no `_`-prefixed middle ground.
 *
 * Scoped to `academic/` because that is where the defect was and where the
 * cleanup has been done. Widening it to the whole backend is a good idea and a
 * separate change — it would fail today on other domains.
 */

const ACADEMIC = join(process.cwd(), 'src', 'academic');

/**
 * `@CurrentUser() _user: AuthenticatedUser` — asked for, deliberately unused.
 */
const IGNORED_CALLER = /@CurrentUser\(\)\s*_[a-zA-Z]*\s*:/g;

function code(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

describe('no academic controller asks for a caller it ignores', () => {
  let controllers: { path: string; text: string }[];

  beforeAll(async () => {
    const found: { path: string; text: string }[] = [];
    for await (const entry of glob('**/*.controller.ts', { cwd: ACADEMIC })) {
      if (entry.endsWith('.spec.ts')) continue;
      found.push({
        path: entry,
        text: code(await readFile(join(ACADEMIC, entry), 'utf8')),
      });
    }
    controllers = found;
  });

  it('finds the academic controllers', () => {
    expect(controllers.length).toBeGreaterThan(20);
  });

  it('never injects the caller under an underscore name', () => {
    const offenders = controllers
      .filter((c) => new RegExp(IGNORED_CALLER.source, 'g').test(c.text))
      .map((c) => c.path)
      .sort();

    expect(offenders).toEqual([]);
  });

  /**
   * Guards the guard. A regex that matches nothing would pass the assertion
   * above while checking nothing at all, so assert it still fires on the exact
   * shape the repository carried until this feature removed it.
   */
  it('recognises the shape it is looking for', () => {
    const ignored = `async findAll(
      @CurrentUser() _user: AuthenticatedUser,
      @Query() query: StudentQueryDto,
    ) {`;
    const used = `async findOne(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
    ) {`;

    expect(new RegExp(IGNORED_CALLER.source).test(ignored)).toBe(true);
    expect(new RegExp(IGNORED_CALLER.source).test(used)).toBe(false);
  });
});
