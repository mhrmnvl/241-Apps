import { PrismaReportCardRepository } from './prisma-report-card.repository.js';
import type { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * The summary must describe the filtered set, never the page.
 *
 * academic-web used to work these figures out from the rows it held, which is
 * one page: a class of 32 shown ten at a time reported "Total Siswa: 10" and
 * averaged those ten. Moving the arithmetic to the backend only fixes that if
 * the aggregate queries are free of `skip` and `take` — reuse the paging
 * arguments by accident and the numbers are exactly as wrong as before, with
 * no visible difference on screen.
 *
 * So this asserts the shape of the queries rather than the arithmetic: same
 * `where` as the page, and no paging on the aggregates.
 */
describe('report card list summary', () => {
  const semester = { id: 'sem-1' };

  function repositoryWithSpies() {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest
      .fn()
      .mockResolvedValueOnce(32) // total
      .mockResolvedValueOnce(12); // published
    const aggregate = jest
      .fn()
      .mockResolvedValue({ _avg: { totalAverage: 81.5 } });

    const prisma = {
      reportCard: { findMany, count, aggregate },
      semester: {
        findFirst: jest.fn().mockResolvedValue(semester),
      },
    } as unknown as PrismaService;

    return {
      repository: new PrismaReportCardRepository(prisma),
      findMany,
      count,
      aggregate,
    };
  }

  it('counts and averages the whole set, not the page', async () => {
    const { repository, findMany, count, aggregate } = repositoryWithSpies();

    const result = await repository.findAll({
      page: 2,
      limit: 10,
      classroomId: 'class-1',
    });

    // The page is paged.
    expect(findMany.mock.calls[0][0]).toMatchObject({ skip: 10, take: 10 });

    // The figures about the set are not.
    for (const call of [...count.mock.calls, ...aggregate.mock.calls]) {
      expect(call[0]).not.toHaveProperty('skip');
      expect(call[0]).not.toHaveProperty('take');
    }

    expect(result.summary).toEqual({
      published: 12,
      draft: 20,
      averageScore: 81.5,
    });
    expect(result.total).toBe(32);
  });

  it('applies the same filter to the page and to the summary', async () => {
    const { repository, findMany, count, aggregate } = repositoryWithSpies();

    await repository.findAll({ page: 1, limit: 10, classroomId: 'class-1' });

    const pageWhere = findMany.mock.calls[0][0].where;
    expect(count.mock.calls[0][0].where).toEqual(pageWhere);
    expect(aggregate.mock.calls[0][0].where).toEqual(pageWhere);

    // The published count is the same filter plus one condition, so a caller
    // filtering by classroom never sees another classroom's published tally.
    expect(count.mock.calls[1][0].where).toEqual({
      ...pageWhere,
      isPublished: true,
    });
  });

  it('reports no average rather than zero when nothing is generated yet', async () => {
    const { repository } = repositoryWithSpies();
    const prisma = (
      repository as unknown as {
        prisma: { reportCard: { aggregate: jest.Mock } };
      }
    ).prisma;
    prisma.reportCard.aggregate.mockResolvedValue({
      _avg: { totalAverage: null },
    });

    const result = await repository.findAll({ page: 1, limit: 10 });

    expect(result.summary?.averageScore).toBeNull();
  });
});
