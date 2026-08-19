import { PrismaReportCardRepository } from './prisma-report-card.repository.js';
import type { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * The student scope must survive the where-clause, not merely be passed to it.
 *
 * It did not. Three filters each spread `enrollment` onto the same object, so
 * the last one present replaced the rest — and the semester filter is always
 * present, because it falls back to the active semester when the caller names
 * none. `GET /rapors/me` therefore returned every student's report card to a
 * student, scores, rank and teacher's note included.
 *
 * The use-case tests did not catch it and could not: they mock this repository,
 * so they assert the scope is handed over and stop there. What found it was
 * signing in as one of two seeded students on the dev box and reading the
 * response — two names came back where one was expected.
 *
 * So these tests exercise the built query rather than the call, and the one
 * that matters is `keeps the student scope when a semester is also applied`.
 */
describe('report card list scoping', () => {
  function repositoryWithSpy() {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const aggregate = jest
      .fn()
      .mockResolvedValue({ _avg: { totalAverage: null } });

    const prisma = {
      reportCard: { findMany, count, aggregate },
      semester: {
        findFirst: jest.fn().mockResolvedValue({ id: 'sem-active' }),
      },
    } as unknown as PrismaService;

    return { repository: new PrismaReportCardRepository(prisma), findMany };
  }

  /**
   * The regression. Both conditions have to reach the query together; keeping
   * either one alone is what the bug did.
   */
  it('keeps the student scope when a semester is also applied', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({ page: 1, limit: 10, studentId: 'stu-1' });

    expect(findMany.mock.calls[0][0].where.enrollment).toEqual({
      studentId: 'stu-1',
      semesterId: 'sem-active',
    });
  });

  it('keeps the student scope alongside a classroom filter', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({
      page: 1,
      limit: 10,
      studentId: 'stu-1',
      classroomId: 'cls-1',
      semesterId: 'sem-9',
    });

    expect(findMany.mock.calls[0][0].where.enrollment).toEqual({
      studentId: 'stu-1',
      classroomId: 'cls-1',
      semesterId: 'sem-9',
    });
  });

  it('never returns an unscoped enrollment filter when a student is named', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({ page: 1, limit: 10, studentId: 'stu-1' });

    // The assertion phrased as the consequence: whatever else the clause
    // carries, it must not be reachable without the student.
    expect(findMany.mock.calls[0][0].where.enrollment.studentId).toBe('stu-1');
  });

  it('omits the enrollment filter entirely when nothing scopes it', async () => {
    const { repository, findMany } = repositoryWithSpy();
    const prismaless = repository as unknown as {
      prisma: { semester: { findFirst: jest.Mock } };
    };
    prismaless.prisma.semester.findFirst.mockResolvedValue(null);

    await repository.findAll({ page: 1, limit: 10 });

    expect(findMany.mock.calls[0][0].where.enrollment).toBeUndefined();
  });
});
