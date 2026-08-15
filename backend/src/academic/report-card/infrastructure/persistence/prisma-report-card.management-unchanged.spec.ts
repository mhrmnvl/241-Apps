import { PrismaReportCardRepository } from './prisma-report-card.repository.js';
import type { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * Narrowing a read for one audience must not narrow it for the other.
 *
 * FR-007 and SC-005 say staff-facing behaviour is unchanged, and a green gate is
 * not evidence of that — the whole feature is a set of filters added to shared
 * queries, and the way that goes wrong is a scope leaking upward into the
 * management path. A teacher who suddenly sees one student's report cards
 * instead of the class would have no idea why.
 *
 * So this asserts the absence: with no scope supplied, nothing student-shaped
 * reaches the query.
 */
describe('report card management read is unchanged', () => {
  function repositoryWithSpy() {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const aggregate = jest
      .fn()
      .mockResolvedValue({ _avg: { totalAverage: 81 } });

    const prisma = {
      reportCard: { findMany, count, aggregate },
      semester: {
        findFirst: jest.fn().mockResolvedValue({ id: 'sem-active' }),
      },
    } as unknown as PrismaService;

    return {
      repository: new PrismaReportCardRepository(prisma),
      findMany,
      count,
    };
  }

  it('carries no student condition when none was asked for', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({ page: 1, limit: 10, classroomId: 'cls-1' });

    const enrollment = findMany.mock.calls[0][0].where.enrollment;
    expect(enrollment.studentId).toBeUndefined();
    expect(enrollment).toEqual({
      classroomId: 'cls-1',
      semesterId: 'sem-active',
    });
  });

  it('returns drafts to a management caller, which the student read never does', async () => {
    const { repository, findMany } = repositoryWithSpy();

    await repository.findAll({ page: 1, limit: 10 });

    // No `isPublished` at all: the class list shows what has been generated,
    // published or not, and that is what the console is for.
    expect(findMany.mock.calls[0][0].where.isPublished).toBeUndefined();
  });

  it('still pages, and still summarises the whole filtered set', async () => {
    const { repository, findMany, count } = repositoryWithSpy();

    const result = await repository.findAll({ page: 3, limit: 20 });

    expect(findMany.mock.calls[0][0]).toMatchObject({ skip: 40, take: 20 });
    // The summary counts are not paged — the regression the summary work fixed.
    for (const call of count.mock.calls) {
      expect(call[0]).not.toHaveProperty('skip');
    }
    expect(result.summary).toBeDefined();
  });
});
