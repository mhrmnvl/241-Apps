import { NotFoundException } from '@nestjs/common';
import { GetMyStudentUseCase } from './get-my-student.use-case.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';

/**
 * A student's own record, and no way to name anyone else's.
 *
 * The subject is resolved from the signed-in account, so there is no parameter
 * to tamper with — which is the whole difference between this and
 * `GET /students/:id`. The tests below are mostly about the absence: nothing
 * reaches the repository except the id this use case looked up itself.
 */
describe('GetMyStudentUseCase', () => {
  function makeUseCase(options: {
    own?: { id: string } | null;
    record?: unknown;
  }) {
    const findByUserId = jest.fn().mockResolvedValue(options.own ?? null);
    const findById = jest.fn().mockResolvedValue(options.record ?? null);

    const useCase = new GetMyStudentUseCase({
      findByUserId,
      findById,
    } as unknown as IStudentRepository);

    return { useCase, findByUserId, findById };
  }

  it('answers with the record belonging to the caller', async () => {
    const { useCase, findByUserId, findById } = makeUseCase({
      own: { id: 'student-1' },
      record: { id: 'student-1', nis: '2460013' },
    });

    const result = await useCase.execute('user-1');

    expect(findByUserId).toHaveBeenCalledWith('user-1');
    expect(findById).toHaveBeenCalledWith('student-1');
    expect(result).toEqual({ id: 'student-1', nis: '2460013' });
  });

  /**
   * An account with no student record — a teacher who somehow holds the
   * permission, or a user mid-provisioning. The absence must stop here rather
   * than fall through into a read with no filter, which is how the report-card
   * exposure began.
   */
  it('refuses an account with no student record', async () => {
    const { useCase, findById } = makeUseCase({ own: null });

    await expect(useCase.execute('user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(findById).not.toHaveBeenCalled();
  });

  it('refuses when the linked record has since gone', async () => {
    const { useCase } = makeUseCase({ own: { id: 'student-1' }, record: null });

    await expect(useCase.execute('user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
