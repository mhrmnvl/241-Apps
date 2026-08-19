import { PrismaClient } from '@prisma/client';
import { findSchedulePage } from './prisma-schedule.queries.js';

/**
 * A teacher's own schedule, scoped where a caller cannot reach it.
 *
 * `teachingAssignment` is already occupied here by the live-academic-year
 * filter, so a teacher scope merged into that object would replace it — or be
 * replaced by it, depending on order. Either way one of the two conditions
 * disappears silently, and a schedule belonging to the wrong teacher looks
 * exactly like the right one.
 *
 * So the scope goes in `AND`. These tests hold that placement.
 */
describe('schedule page scoping', () => {
  function prismaWithSpy() {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    return {
      prisma: { schedule: { findMany, count } } as unknown as PrismaClient,
      findMany,
    };
  }

  it('keeps the live-academic-year filter and the teacher scope together', async () => {
    const { prisma, findMany } = prismaWithSpy();

    await findSchedulePage(prisma as never, {
      page: 1,
      limit: 10,
      teacherId: 'tea-1',
    });

    const where = findMany.mock.calls[0][0].where;
    expect(where.teachingAssignment).toBeDefined();
    expect(where.AND).toEqual([{ teachingAssignment: { teacherId: 'tea-1' } }]);
  });

  /**
   * Naming an assignment is how a caller would try to reach another teacher's
   * lesson. The scope narrows the same query regardless.
   */
  it('keeps the teacher scope when the caller names an assignment', async () => {
    const { prisma, findMany } = prismaWithSpy();

    await findSchedulePage(prisma as never, {
      page: 1,
      limit: 10,
      teacherId: 'tea-1',
      teachingAssignmentId: 'ta-of-someone-else',
    });

    const where = findMany.mock.calls[0][0].where;
    expect(where.teachingAssignmentId).toBe('ta-of-someone-else');
    expect(where.AND).toEqual([{ teachingAssignment: { teacherId: 'tea-1' } }]);
  });

  it('adds no scope when none is asked for', async () => {
    const { prisma, findMany } = prismaWithSpy();

    await findSchedulePage(prisma as never, { page: 1, limit: 10 });

    expect(findMany.mock.calls[0][0].where.AND).toBeUndefined();
  });
});
