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
 * as though identity was considered. So the rule is syntactic and absolute: if
 * a route does not use the caller, it must not ask for them. A route about the
 * school takes no caller and says so by its absence; a route about a person
 * takes one and uses it. There is no third state.
 *
 * This checked only the `_`-prefixed form until 2026-08-15, and only under
 * `academic/`. Both limits were wrong in the same direction. `_user` at least
 * records that ignoring the caller was a decision; a plain `user` sitting
 * unused reads exactly like one that is used, which is the more deceiving of
 * the two — and 121 of them were live across academic, platform and the
 * domains the old scope never looked at. They were removed with this widening.
 *
 * The body is found by matching braces rather than by regex. A signature that
 * spans lines otherwise truncates the body being searched, and every handler
 * then looks as though it ignores its caller — a sweep that flags everything is
 * as useless as one that flags nothing, and harder to disbelieve.
 */

const SRC = join(process.cwd(), 'src');

/** `@CurrentUser() user:` / `@CurrentUser('id') userId,` — however it is named. */
const DECLARED_CALLER =
  /@CurrentUser\((?:'[a-zA-Z]+')?\)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[:,)]/;

function blankComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));
}

/**
 * The body of the handler whose parameter list contains `from`.
 *
 * Depth starts at 1 because `from` is already inside the parameter list, and
 * only parentheses are counted. Closing `@CurrentUser()`'s own bracket and then
 * taking the next `{` looks equivalent and is not: `@Res({ passthrough: true })`
 * puts a brace in a later parameter, so that shortcut reads `passthrough: true`
 * as the body and reports every such handler as ignoring its caller. `logout`
 * is exactly that shape, and it does use `user`.
 */
function handlerBody(text: string, from: number): string {
  let i = from;
  let depth = 1;
  while (i < text.length) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  while (i < text.length && text[i] !== '{') i++;
  const start = i;
  let braces = 0;
  while (i < text.length) {
    if (text[i] === '{') braces++;
    else if (text[i] === '}') {
      braces--;
      if (braces === 0) break;
    }
    i++;
  }
  return text.slice(start + 1, i);
}

function ignoredCallers(text: string): string[] {
  const source = blankComments(text);
  const re = new RegExp(DECLARED_CALLER.source, 'g');
  const found: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const name = m[1];
    if (!new RegExp('\\b' + name + '\\b').test(handlerBody(source, m.index))) {
      found.push(name);
    }
  }
  return found;
}

describe('no controller asks for a caller it ignores', () => {
  let controllers: { path: string; text: string }[];

  beforeAll(async () => {
    const found: { path: string; text: string }[] = [];
    for await (const entry of glob('**/*.controller.ts', { cwd: SRC })) {
      if (entry.endsWith('.spec.ts')) continue;
      found.push({
        path: entry.replace(/\\/g, '/'),
        text: await readFile(join(SRC, entry), 'utf8'),
      });
    }
    controllers = found;
  }, 60_000);

  it('finds the controllers', () => {
    expect(controllers.length).toBeGreaterThan(60);
  });

  it('reads every caller it injects', () => {
    const offenders = controllers
      .flatMap((c) =>
        ignoredCallers(c.text).map((name) => `${c.path}: ${name}`),
      )
      .sort();

    expect(offenders).toEqual([]);
  });

  /**
   * The `_`-prefixed form is the same defect wearing a label, and the label is
   * what made a reader skim past it. Kept as its own assertion so the intent
   * survives even if the detection above is ever loosened.
   */
  it('never injects the caller under an underscore name', () => {
    const offenders = controllers
      .filter((c) => /@CurrentUser\([^)]*\)\s*_[a-zA-Z]*\s*:/.test(c.text))
      .map((c) => c.path)
      .sort();

    expect(offenders).toEqual([]);
  });

  /**
   * Guards the guard. A detector that matched nothing would pass every
   * assertion above while checking nothing at all, so assert it still fires on
   * the exact shape the repository carried — and stays quiet on the correct one.
   */
  it('recognises the shapes it looks for', () => {
    const ignored = `
      async findAll(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: StudentQueryDto,
      ) {
        return this.getStudentsUseCase.execute(query);
      }`;
    const used = `
      async findMine(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: StudentQueryDto,
      ) {
        return this.getStudentsUseCase.execute({ ...query, userId: user.id });
      }`;
    // A brace inside a *later* parameter's decorator, which is what made the
    // first version of this detector report every such handler as an offender.
    const braceInLaterParam = `
      async logout(
        @CurrentUser() user: AuthenticatedUser,
        @Res({ passthrough: true }) res: Response,
      ) {
        await this.logoutUseCase.execute(user.sessionId);
      }`;

    expect(ignoredCallers(ignored)).toEqual(['user']);
    expect(ignoredCallers(used)).toEqual([]);
    expect(ignoredCallers(braceInLaterParam)).toEqual([]);
  });
});
