import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * FR-055, FR-056, SC-016: everyone on the employee roster is eligible for
 * attendance, leave, and payroll — whatever their position.
 *
 * The requester was explicit that positions in production are selectable master
 * data, not code: "apapun jabatan yang ditambahkan manual, itu bisa ikut absen".
 * A position added next year must work the day someone is assigned to it, with
 * no deployment.
 *
 * Asserted structurally rather than by seeding a new position and exercising an
 * endpoint, because the guarantee is about what these domains *can* branch on.
 * If no file can name a position, no behaviour can depend on one — and the
 * failure this prevents is silent: an employee simply never appears, and nobody
 * discovers it until they ask why they were not paid.
 */

const ROOTS = [
  join(process.cwd(), 'src', 'presence'),
  join(process.cwd(), 'src', 'payroll'),
];

/**
 * Prisma models and columns that carry a person's role in the school.
 *
 * Reading any of these from presence or payroll is what would let a rule become
 * position-specific.
 */
const FORBIDDEN_MODELS = [
  'prisma.position',
  'prisma.positionCategory',
  'prisma.teacherPosition',
  'prisma.employmentType',
  'positionId',
  'positionCategoryId',
  'employmentTypeId',
];

/**
 * Literal position and employment-type codes seeded today.
 *
 * A comparison against any of these is the concrete shape the defect takes:
 * `if (position === 'KEPALA_SEKOLAH')` works until the school adds a deputy.
 */
const FORBIDDEN_CODES = [
  'KEPALA_SEKOLAH',
  'WAKIL_KEPALA',
  'GURU_MAPEL',
  'WALI_KELAS',
  'STAF_TU',
  'KEPALA_TU',
  'PNS',
  'GTY',
  'GTT',
  'PTY',
  'PTT',
  'HONORER',
];

async function sourceFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of glob('**/*.ts', { cwd: root })) {
    if (!entry.endsWith('.spec.ts')) files.push(entry);
  }
  return files;
}

describe('presence & payroll roster independence (FR-055, FR-056)', () => {
  let sources: { path: string; text: string }[];

  beforeAll(async () => {
    sources = (
      await Promise.all(
        ROOTS.map(async (root) => {
          const files = await sourceFiles(root);
          return Promise.all(
            files.map(async (path) => ({
              path: join(root, path),
              text: await readFile(join(root, path), 'utf8'),
            })),
          );
        }),
      )
    ).flat();
  });

  it('finds source files to check', () => {
    // Guards the test itself: an empty sweep would pass everything below.
    expect(sources.length).toBeGreaterThan(50);
  });

  it.each(FORBIDDEN_MODELS)('never reads %s', (model) => {
    const offenders = sources
      .filter((source) => source.text.includes(model))
      .map((source) => source.path);

    expect(offenders).toEqual([]);
  });

  it.each(FORBIDDEN_CODES)('never branches on the code %s', (code) => {
    const offenders = sources
      .filter((source) => source.text.includes(`'${code}'`))
      .map((source) => source.path);

    expect(offenders).toEqual([]);
  });

  /**
   * Payroll's roster comes from the whole active employee list, unfiltered.
   * Narrowing it by anything other than "active" is how a newly created
   * position quietly stops being paid.
   */
  it('takes the payroll roster from active employees alone', async () => {
    const roster = await readFile(
      join(process.cwd(), 'src/payroll/run/services/payroll-roster.service.ts'),
      'utf8',
    );

    expect(roster).toContain('findAllForExport({ isActive: true })');
  });
});
