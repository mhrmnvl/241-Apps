import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';
import { PromotionSemesterResolver } from './promotion-semester-resolver.service.js';

/**
 * Which terms a promotion touches, and that nothing here reads a term's name.
 *
 * A promotion means "move up a year", but enrolment is keyed on a semester, so
 * the operation still has to name two of them. These cases pin down that the
 * caller never does — and that the pair chosen is the last term of the year
 * being left and the first term of the year being entered.
 */
describe('PromotionSemesterResolver', () => {
  let resolver: PromotionSemesterResolver;

  const repository = {
    findEdgeSemesterOfAcademicYear: jest.fn(),
    findAcademicYearName: jest.fn(),
  };

  const semester = (id: string, academicYearId: string) => ({
    id,
    academicYearId,
    academicYear: { id: academicYearId, name: academicYearId },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionSemesterResolver,
        { provide: IPromotionRepository, useValue: repository },
      ],
    }).compile();

    resolver = module.get(PromotionSemesterResolver);
    jest.clearAllMocks();
    repository.findAcademicYearName.mockResolvedValue(null);
  });

  it('reads from the last term of the old year and writes into the first of the new', async () => {
    repository.findEdgeSemesterOfAcademicYear
      .mockResolvedValueOnce(semester('genap-2025', 'ay-2025'))
      .mockResolvedValueOnce(semester('ganjil-2026', 'ay-2026'));

    const result = await resolver.resolve('ay-2025', 'ay-2026');

    expect(result.source.id).toBe('genap-2025');
    expect(result.target.id).toBe('ganjil-2026');
    expect(repository.findEdgeSemesterOfAcademicYear).toHaveBeenNthCalledWith(
      1,
      'ay-2025',
      'last',
    );
    expect(repository.findEdgeSemesterOfAcademicYear).toHaveBeenNthCalledWith(
      2,
      'ay-2026',
      'first',
    );
  });

  /**
   * The reason the whole endpoint moved to academic years. Naming one year
   * twice is a rollover, and saying so is more use than a validation error
   * about semesters the caller never mentioned.
   */
  it('refuses one year twice, and points at rollover', async () => {
    await expect(resolver.resolve('ay-2025', 'ay-2025')).rejects.toThrow(
      BadRequestException,
    );
    await expect(resolver.resolve('ay-2025', 'ay-2025')).rejects.toThrow(
      /rollover/i,
    );
    expect(repository.findEdgeSemesterOfAcademicYear).not.toHaveBeenCalled();
  });

  it('names the year when it has no term to read from', async () => {
    repository.findEdgeSemesterOfAcademicYear
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(semester('ganjil-2026', 'ay-2026'));
    repository.findAcademicYearName.mockResolvedValue('2025/2026');

    await expect(resolver.resolve('ay-2025', 'ay-2026')).rejects.toThrow(
      /2025\/2026/,
    );
  });

  it('names the year when it has no term to write into', async () => {
    repository.findEdgeSemesterOfAcademicYear
      .mockResolvedValueOnce(semester('genap-2025', 'ay-2025'))
      .mockResolvedValueOnce(null);
    repository.findAcademicYearName.mockResolvedValue('2026/2027');

    await expect(resolver.resolve('ay-2025', 'ay-2026')).rejects.toThrow(
      /2026\/2027/,
    );
  });

  /**
   * A year whose name cannot be read still produces a message rather than
   * `undefined` — the id is poor, but it is something to search for.
   */
  it('falls back to the id when the year has no readable name', async () => {
    repository.findEdgeSemesterOfAcademicYear
      .mockResolvedValueOnce(semester('genap-2025', 'ay-2025'))
      .mockResolvedValueOnce(null);
    repository.findAcademicYearName.mockResolvedValue(null);

    await expect(resolver.resolve('ay-2025', 'ay-2026')).rejects.toThrow(
      /ay-2026/,
    );
  });
});
