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

  describe('students the school decided not to graduate', () => {
    /**
     * Before this, a held student was simply left out of the payload: their
     * enrolment stayed ACTIVE, nothing recorded the decision, and the reason
     * the operator was made to type never left the browser.
     */
    it('records them alongside the graduations', async () => {
      mockRepo.executeBulk.mockResolvedValue({
        graduated: 1,
        skipped: 0,
        held: 1,
      });

      const result = await useCase.execute({
        students: [{ studentId: 'stu-1' }],
        held: [{ studentId: 'stu-2', reason: 'Nilai belum lengkap' }],
      });

      expect(result.held).toBe(1);
      expect(mockRepo.executeBulk).toHaveBeenCalledWith({
        academicYearId: 'ay-1',
        students: [{ studentId: 'stu-1' }],
        held: [{ studentId: 'stu-2', reason: 'Nilai belum lengkap' }],
      });
    });

    /** A class whose marks are not in yet is a real thing to want. */
    it('allows a run that only holds people', async () => {
      mockRepo.executeBulk.mockResolvedValue({
        graduated: 0,
        skipped: 0,
        held: 2,
      });

      await expect(
        useCase.execute({
          students: [],
          held: [
            { studentId: 'stu-1', reason: 'Nilai belum lengkap' },
            { studentId: 'stu-2', reason: 'Belum melunasi administrasi' },
          ],
        }),
      ).resolves.toEqual({ graduated: 0, skipped: 0, held: 2 });
    });

    it('refuses a run that does neither', async () => {
      await expect(useCase.execute({ students: [], held: [] })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepo.executeBulk).not.toHaveBeenCalled();
    });

    /**
     * Graduated and held are opposite answers to one question. Letting one
     * win silently would record an outcome nobody chose.
     */
    it('refuses a student who is in both lists', async () => {
      await expect(
        useCase.execute({
          students: [{ studentId: 'stu-1' }],
          held: [{ studentId: 'stu-1', reason: 'Nilai belum lengkap' }],
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepo.executeBulk).not.toHaveBeenCalled();
    });

    it('refuses the same student held twice', async () => {
      await expect(
        useCase.execute({
          students: [],
          held: [
            { studentId: 'stu-1', reason: 'a' },
            { studentId: 'stu-1', reason: 'b' },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    /** The ordinary year, where everyone finishes, carries no ceremony. */
    it('sends no held list when there is nothing to hold', async () => {
      mockRepo.executeBulk.mockResolvedValue({
        graduated: 1,
        skipped: 0,
        held: 0,
      });

      await useCase.execute({ students: [{ studentId: 'stu-1' }] });

      expect(mockRepo.executeBulk).toHaveBeenCalledWith({
        academicYearId: 'ay-1',
        students: [{ studentId: 'stu-1' }],
      });
    });
  });
});
