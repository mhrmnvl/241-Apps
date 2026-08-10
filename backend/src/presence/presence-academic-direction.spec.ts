import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * ADR-0007: the `academic → presence` edge is one-way.
 *
 * `academic/attendance` pre-fills a class from the gate through
 * `IDailyPresenceReadPort`, and presence never reads back. That is what keeps
 * the domain graph acyclic — `platform ← presence ← {academic, payroll}` — and
 * a cycle here is not a style complaint: NestJS resolves an import cycle by
 * handing a module `undefined` at boot, which is a crash, not a warning.
 *
 * `payroll → academic` is allowed and is the reason this sweep covers only
 * `presence/`: payroll reads the employee roster through `ITeacherRepository`,
 * which is a dependency in the permitted direction.
 */

const PRESENCE_SRC = join(process.cwd(), 'src', 'presence');

async function presenceSourceFiles(): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of glob('**/*.ts', { cwd: PRESENCE_SRC })) {
    if (!entry.endsWith('.spec.ts')) files.push(entry);
  }
  return files;
}

describe('presence → academic direction (ADR-0007)', () => {
  let sources: { path: string; text: string }[];

  beforeAll(async () => {
    const files = await presenceSourceFiles();
    sources = await Promise.all(
      files.map(async (path) => ({
        path,
        text: await readFile(join(PRESENCE_SRC, path), 'utf8'),
      })),
    );
  });

  it('finds presence source files to check', () => {
    expect(sources.length).toBeGreaterThan(40);
  });

  it('never imports from src/academic', () => {
    const offenders = sources
      .filter((source) => /from\s+'[^']*\/academic\//.test(source.text))
      .map((source) => source.path);

    expect(offenders).toEqual([]);
  });

  /**
   * Presence does not know classrooms, students-as-students, or subjects
   * exist. It knows user ids — which is exactly why it serves both employees
   * and students without a second implementation.
   */
  it.each([
    'prisma.classroom',
    'prisma.enrollment',
    'prisma.subject',
    'prisma.attendance.',
    'prisma.student.',
    'prisma.teacher.',
  ])('never reads %s', (model) => {
    const offenders = sources
      .filter((source) => source.text.includes(model))
      .map((source) => source.path);

    expect(offenders).toEqual([]);
  });
});
