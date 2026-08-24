import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PrismaAcademicYearRepository } from './prisma-academic-year.repository.js';

/**
 * Activating a year moves the term with it.
 *
 * The year and the semester each had their own `isActive`, and only the year's
 * was touched here — so the school could show 2027/2028 as its year while
 * every read scoped to the active semester still answered about Genap
 * 2026/2027. Nothing errored; the two simply disagreed.
 *
 * These run the transaction body against a stubbed client, because that body
 * is where the rule lives and there is no pure function to point at.
 */
describe('academic year activation', () => {
  const semester = {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
  };
  const academicYear = {
    updateMany: jest.fn(),
    update: jest.fn(),
  };

  const tx = { semester, academicYear };
  const prisma = {
    $transaction: jest.fn((cb: (client: typeof tx) => unknown) => cb(tx)),
  };

  const repository = new PrismaAcademicYearRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    academicYear.update.mockResolvedValue({ id: 'ay-new', isActive: true });
  });

  it('activates the first term of the year it activates', async () => {
    semester.findFirst.mockResolvedValue({ id: 'ganjil-new' });

    await repository.activateById('ay-new');

    expect(semester.update).toHaveBeenCalledWith({
      where: { id: 'ganjil-new' },
      data: { isActive: true },
    });
  });

  /**
   * By `sequence`, never by name. Semester types are master data the school
   * edits, and the column exists because ordering on the name sorted the
   * English enum alphabetically — EVEN before ODD — so Genap came out first.
   */
  it('picks that term by sequence rather than by name', async () => {
    semester.findFirst.mockResolvedValue({ id: 'ganjil-new' });

    await repository.activateById('ay-new');

    expect(semester.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { academicYearId: 'ay-new', deletedAt: null },
        orderBy: [{ type: { sequence: 'asc' } }, { id: 'asc' }],
      }),
    );
  });

  it('stands down whatever term was active before, and only that', async () => {
    semester.findFirst.mockResolvedValue({ id: 'ganjil-new' });

    await repository.activateById('ay-new');

    expect(semester.updateMany).toHaveBeenCalledWith({
      where: { isActive: true, NOT: { id: 'ganjil-new' } },
      data: { isActive: false },
    });
  });

  /**
   * A year still being set up has no term to hand over to. Leaving the old one
   * active would mean a term belonging to a year that is no longer current;
   * no active semester is an honest empty, and the screens already render it.
   */
  it('leaves no term active when the incoming year has none', async () => {
    semester.findFirst.mockResolvedValue(null);

    await repository.activateById('ay-empty');

    expect(semester.updateMany).toHaveBeenCalledWith({
      where: { isActive: true },
      data: { isActive: false },
    });
    expect(semester.update).not.toHaveBeenCalled();
  });

  it('still deactivates the year that was active', async () => {
    semester.findFirst.mockResolvedValue(null);

    await repository.activateById('ay-new');

    expect(academicYear.updateMany).toHaveBeenCalledWith({
      where: { isActive: true },
      data: { isActive: false },
    });
    expect(academicYear.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ay-new' } }),
    );
  });

  /** One transaction: a year that changed while its term did not is the state this prevents. */
  it('does all of it in one transaction', async () => {
    semester.findFirst.mockResolvedValue({ id: 'ganjil-new' });

    await repository.activateById('ay-new');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
