import { ForbiddenException } from '@nestjs/common';
import { GradeAssignedStudentScoresUseCase } from './grade-assigned-student-scores.use-case.js';
import { BulkUpsertStudentScoresUseCase } from './bulk-upsert-student-scores.use-case.js';

/**
 * Who may enter a mark, and whose name goes on it.
 *
 * Every teacher held `student-scores.manage`, which grades any class in the
 * school, and the screen offered every classroom and subject in dropdowns. So
 * the question this narrows is not hypothetical: a teacher of Matematika in
 * VII-A could enter marks for Bahasa Inggris in VIII-B.
 *
 * Two reaches are allowed, and both come from records rather than role names —
 * the school names its own roles, one of them `Wali Kelas`, and a role-name
 * check is what once showed a teacher with a custom role the administrator's
 * screen.
 */
describe('GradeAssignedStudentScoresUseCase', () => {
  const USER = 'user-1';
  const TEACHER = 'teacher-1';
  const ITEM = 'item-1';

  function makeUseCase(options: {
    teacherId?: string | null;
    teaches?: boolean;
    supervises?: boolean | boolean[];
  }) {
    const execute = jest.fn().mockResolvedValue({ saved: 1 });

    const supervisesQueue = Array.isArray(options.supervises)
      ? [...options.supervises]
      : null;
    const supervisesEnrollment = jest.fn().mockImplementation(() => {
      if (supervisesQueue) return Promise.resolve(supervisesQueue.shift());
      return Promise.resolve(options.supervises ?? false);
    });

    const useCase = new GradeAssignedStudentScoresUseCase(
      { execute } as unknown as BulkUpsertStudentScoresUseCase,
      {
        findTeacherIdByUserId: jest
          .fn()
          .mockResolvedValue(
            options.teacherId === undefined ? TEACHER : options.teacherId,
          ),
      },
      {
        teachesAssessmentItem: jest
          .fn()
          .mockResolvedValue(options.teaches ?? false),
        supervisesEnrollment,
      },
    );

    return { useCase, execute, supervisesEnrollment };
  }

  const dto = (...enrollmentIds: string[]) => ({
    assessmentItemId: ITEM,
    records: enrollmentIds.map((enrollmentId) => ({
      enrollmentId,
      score: 80,
    })),
  });

  describe('the subject you teach', () => {
    it('saves, and does not mark it as a correction', async () => {
      const { useCase, execute } = makeUseCase({ teaches: true });

      await useCase.execute(dto('enr-1', 'enr-2'), USER);

      // Second argument absent: the subject teacher entered these, which is
      // the ordinary case and must not read as somebody else's correction.
      expect(execute).toHaveBeenCalledWith(dto('enr-1', 'enr-2'));
    });

    it('does not ask about supervision it does not need', async () => {
      const { useCase, supervisesEnrollment } = makeUseCase({ teaches: true });

      await useCase.execute(dto('enr-1'), USER);

      expect(supervisesEnrollment).not.toHaveBeenCalled();
    });
  });

  describe('the class you supervise', () => {
    it('saves, recorded as a correction by the caller', async () => {
      const { useCase, execute } = makeUseCase({
        teaches: false,
        supervises: true,
      });

      await useCase.execute(dto('enr-1'), USER);

      expect(execute).toHaveBeenCalledWith(dto('enr-1'), USER);
    });

    /**
     * The one that matters. A request naming one of their own students and one
     * of somebody else's must not pass on the strength of the first — which is
     * what a `some()` would have done.
     */
    it('refuses a roster that mixes their class with another', async () => {
      const { useCase, execute } = makeUseCase({
        teaches: false,
        supervises: [true, false],
      });

      await expect(
        useCase.execute(dto('mine', 'theirs'), USER),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(execute).not.toHaveBeenCalled();
    });
  });

  describe('neither', () => {
    it('refuses a subject the caller does not teach', async () => {
      const { useCase, execute } = makeUseCase({
        teaches: false,
        supervises: false,
      });

      await expect(useCase.execute(dto('enr-1'), USER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(execute).not.toHaveBeenCalled();
    });

    /**
     * An account with no teaching record at all. The absence must stop here
     * rather than fall through into the unscoped write next door.
     */
    it('refuses a caller with no teaching record', async () => {
      const { useCase, execute } = makeUseCase({
        teacherId: null,
        teaches: true,
        supervises: true,
      });

      await expect(useCase.execute(dto('enr-1'), USER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(execute).not.toHaveBeenCalled();
    });
  });
});
