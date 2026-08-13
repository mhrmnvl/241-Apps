import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import { BulkGraduateStudentsUseCase } from './bulk-graduate-students.use-case.js';

describe('BulkGraduateStudentsUseCase', () => {
  let useCase: BulkGraduateStudentsUseCase;

  const mockRepo = {
    executeBulk: jest.fn(),
    findActiveAcademicYearId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkGraduateStudentsUseCase,
        { provide: IGraduationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get(BulkGraduateStudentsUseCase);
    jest.clearAllMocks();
    mockRepo.findActiveAcademicYearId.mockResolvedValue('ay-1');
  });

  it('graduates the cohort it is given', async () => {
    mockRepo.executeBulk.mockResolvedValue({ graduated: 2, skipped: 0 });

    const result = await useCase.execute({
      students: [{ studentId: 'stu-1' }, { studentId: 'stu-2' }],
    });

    expect(result).toEqual({ graduated: 2, skipped: 0 });
    expect(mockRepo.executeBulk).toHaveBeenCalledWith({
      academicYearId: 'ay-1',
      students: [{ studentId: 'stu-1' }, { studentId: 'stu-2' }],
    });
  });

  /**
   * The academic year is the server's answer, not the caller's. A client that
   * sent the wrong one would file a whole cohort under it, and nothing
   * downstream would notice.
   */
  it('takes the academic year from the active semester', async () => {
    mockRepo.findActiveAcademicYearId.mockResolvedValue('ay-active');
    mockRepo.executeBulk.mockResolvedValue({ graduated: 1, skipped: 0 });

    await useCase.execute({ students: [{ studentId: 'stu-1' }] });

    expect(mockRepo.executeBulk).toHaveBeenCalledWith(
      expect.objectContaining({ academicYearId: 'ay-active' }),
    );
  });

  it('refuses to run when no semester is active', async () => {
    mockRepo.findActiveAcademicYearId.mockResolvedValue(null);

    await expect(
      useCase.execute({ students: [{ studentId: 'stu-1' }] }),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepo.executeBulk).not.toHaveBeenCalled();
  });

  /**
   * A duplicated id would be graduated once and then counted as skipped, which
   * reads as "already graduated" and hides that the caller sent them twice.
   */
  it('rejects a request naming the same student twice', async () => {
    await expect(
      useCase.execute({
        students: [{ studentId: 'stu-1' }, { studentId: 'stu-1' }],
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockRepo.executeBulk).not.toHaveBeenCalled();
  });

  it('rejects an empty selection', async () => {
    await expect(useCase.execute({ students: [] })).rejects.toThrow(
      BadRequestException,
    );

    expect(mockRepo.executeBulk).not.toHaveBeenCalled();
  });

  /** A date given for the cohort applies to all of them. */
  it('passes the graduation date through as a Date', async () => {
    mockRepo.executeBulk.mockResolvedValue({ graduated: 1, skipped: 0 });

    await useCase.execute({
      graduationDate: '2026-06-15',
      students: [{ studentId: 'stu-1' }],
    });

    const passed = mockRepo.executeBulk.mock.calls[0][0] as {
      graduationDate: Date;
    };
    expect(passed.graduationDate).toBeInstanceOf(Date);
    expect(passed.graduationDate.toISOString()).toContain('2026-06-15');
  });

  /**
   * Skipped students are reported, not hidden: a re-run after a partial failure
   * must be safe, and the operator has to be able to tell that it was a re-run.
   */
  it('reports students who already had a record as skipped', async () => {
    mockRepo.executeBulk.mockResolvedValue({ graduated: 1, skipped: 3 });

    const result = await useCase.execute({
      students: [
        { studentId: 'stu-1' },
        { studentId: 'stu-2' },
        { studentId: 'stu-3' },
        { studentId: 'stu-4' },
      ],
    });

    expect(result).toEqual({ graduated: 1, skipped: 3 });
  });
});
