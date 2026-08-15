import { PrismaStudentScoreRepository } from './prisma-student-score.repository.js';
import type { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * A student's marks reach them through their enrolment, and the scope has to
 * arrive at the query intact.
 *
 * The same defect that emptied the report-card scope would be invisible here
 * too: a caller naming `enrollmentId` or `classroomId` alongside their own
 * scope must not widen the result, and a list of marks belonging to the wrong
 * person is not distinguishable from the right one on screen.
 *
 * Two other filters are exercised because they were declared on this
 * repository's port and silently dropped by its implementation until this
 * feature — `classroomId` and `semesterId` returned every score and no error.
 */
describe('student score list scoping', () => {
  function repositoryWithSpy() {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      studentScore: { findMany, count },
    } as unknown as PrismaService;

    return { repository: new PrismaStudentScoreRepository(prisma), findMany };
  }

  it('reaches the student through the enrolment', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({ page: 1, limit: 10, studentId: 'stu-1' });

    expect(findMany.mock.calls[0][0].where.enrollment).toEqual({
      studentId: 'stu-1',
    });
  });

  /**
   * The one that matters. Naming somebody else's enrolment must not reach it:
   * the student condition narrows the same query.
   */
  it('keeps the student scope when the caller also names an enrolment', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({
      page: 1,
      limit: 10,
      studentId: 'stu-1',
      enrollmentId: 'enr-of-someone-else',
    });

    const where = findMany.mock.calls[0][0].where;
    expect(where.enrollment).toEqual({ studentId: 'stu-1' });
    expect(where.enrollmentId).toBe('enr-of-someone-else');
  });

  it('honours classroom and semester, which it used to declare and drop', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({
      page: 1,
      limit: 10,
      classroomId: 'cls-1',
      semesterId: 'sem-1',
    });

    expect(findMany.mock.calls[0][0].where.enrollment).toEqual({
      classroomId: 'cls-1',
      semesterId: 'sem-1',
    });
  });

  it('adds no enrolment clause when nothing needs one', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({ page: 1, limit: 10 });

    expect(findMany.mock.calls[0][0].where.enrollment).toBeUndefined();
  });
});
