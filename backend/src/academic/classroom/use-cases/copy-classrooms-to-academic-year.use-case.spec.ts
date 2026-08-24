import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../../academic-year/domain/interfaces/academic-year-repository.interface.js';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { CopyClassroomsToAcademicYearUseCase } from './copy-classrooms-to-academic-year.use-case.js';

/**
 * Giving a new year the classrooms the old one had.
 *
 * The refusals matter as much as the copy. A promotion works out which level
 * follows which from the levels present in the target year, so a year that is
 * empty — or half filled — makes it recommend confidently and wrongly, with
 * nothing on screen to say so.
 */
describe('CopyClassroomsToAcademicYearUseCase', () => {
  let useCase: CopyClassroomsToAcademicYearUseCase;

  const classrooms = { copyToAcademicYear: jest.fn() };
  const academicYears = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CopyClassroomsToAcademicYearUseCase,
        { provide: IClassroomRepository, useValue: classrooms },
        { provide: IAcademicYearRepository, useValue: academicYears },
      ],
    }).compile();

    useCase = module.get(CopyClassroomsToAcademicYearUseCase);
    jest.resetAllMocks();

    academicYears.findById.mockImplementation((id: string) =>
      Promise.resolve({
        id,
        name: id === 'ay-2026' ? '2026/2027' : '2027/2028',
      }),
    );
  });

  it('copies one year into the other', async () => {
    classrooms.copyToAcademicYear.mockResolvedValue({
      created: 6,
      skipped: 0,
    });

    const result = await useCase.execute('ay-2026', 'ay-2027');

    expect(result).toEqual({ created: 6, skipped: 0 });
    expect(classrooms.copyToAcademicYear).toHaveBeenCalledWith(
      'ay-2026',
      'ay-2027',
    );
  });

  /**
   * The reason the repository matches on the table's own unique key. Somebody
   * who is unsure whether the copy ran can simply run it again.
   */
  it('adds nothing the second time', async () => {
    classrooms.copyToAcademicYear.mockResolvedValue({
      created: 0,
      skipped: 6,
    });

    await expect(useCase.execute('ay-2026', 'ay-2027')).resolves.toEqual({
      created: 0,
      skipped: 6,
    });
  });

  /** A year already holding IX-A gains the other five and keeps that one. */
  it('fills the gaps around what is already there', async () => {
    classrooms.copyToAcademicYear.mockResolvedValue({
      created: 5,
      skipped: 1,
    });

    await expect(useCase.execute('ay-2026', 'ay-2027')).resolves.toEqual({
      created: 5,
      skipped: 1,
    });
  });

  it('refuses one year twice', async () => {
    await expect(useCase.execute('ay-2026', 'ay-2026')).rejects.toThrow(
      BadRequestException,
    );
    expect(classrooms.copyToAcademicYear).not.toHaveBeenCalled();
  });

  it('refuses a year that does not exist', async () => {
    academicYears.findById.mockResolvedValueOnce(null);

    await expect(useCase.execute('ay-nope', 'ay-2027')).rejects.toThrow(
      BadRequestException,
    );
    expect(classrooms.copyToAcademicYear).not.toHaveBeenCalled();
  });

  /**
   * An empty source is a refusal rather than a quiet success: the caller asked
   * for next year to be ready, and reporting "done" would leave it exactly as
   * unready as before.
   */
  it('refuses when the source year has no classrooms, and names it', async () => {
    classrooms.copyToAcademicYear.mockResolvedValue({
      created: 0,
      skipped: 0,
    });

    await expect(useCase.execute('ay-2026', 'ay-2027')).rejects.toThrow(
      /2026\/2027 has no classrooms/,
    );
  });
});
