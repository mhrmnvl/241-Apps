import { plainToInstance } from 'class-transformer';
import { PrismaAssetUnitRepository } from './prisma-asset-unit.repository.js';
import { AssetUnitQueryDto } from '../../dto/request/asset-unit-query.dto.js';
import type { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * "Which units may be lent" is one rule, and it now lives on one side.
 *
 * The loan form used to answer it in the browser, over every asset the API
 * would return, while `CreateLoanUseCase` answered it again on submit. Two
 * copies of a rule drift — that is how the inventory approve and reject paths
 * came to disagree, one throwing and the other writing an empty uuid.
 */
describe('lendable asset units', () => {
  function repositoryWithSpies() {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      inventoryAssetUnit: { findMany, count },
    } as unknown as PrismaService;

    return { repository: new PrismaAssetUnitRepository(prisma), findMany };
  }

  it('asks the database for units whose status permits transactions', async () => {
    const { repository, findMany } = repositoryWithSpies();

    await repository.findAll({ page: 1, limit: 50, lendable: true });

    expect(findMany.mock.calls[0][0].where).toEqual({
      deletedAt: null,
      status: { allowTransactions: true },
    });
  });

  it('lists everything when lendable is not asked for', async () => {
    const { repository, findMany } = repositoryWithSpies();

    await repository.findAll({ page: 1, limit: 50 });

    expect(findMany.mock.calls[0][0].where).toEqual({ deletedAt: null });
  });

  it('never returns a soft-deleted unit', async () => {
    const { repository, findMany } = repositoryWithSpies();

    await repository.findAll({ page: 1, limit: 50, lendable: true });

    expect(findMany.mock.calls[0][0].where).toMatchObject({ deletedAt: null });
  });

  /**
   * A query string carries 'true' and 'false', both non-empty strings and both
   * truthy. Without the transform, `lendable=false` would filter exactly as
   * `lendable=true` does — a bug with no visible symptom, since the wrong
   * answer is a plausible list of units.
   */
  describe('the query parameter', () => {
    function parse(value: unknown) {
      return plainToInstance(AssetUnitQueryDto, { lendable: value });
    }

    it('reads the string "true" as true', () => {
      expect(parse('true').lendable).toBe(true);
    });

    it('reads the string "false" as false, not as a truthy string', () => {
      expect(parse('false').lendable).toBe(false);
    });

    it('accepts a real boolean unchanged', () => {
      expect(parse(true).lendable).toBe(true);
      expect(parse(false).lendable).toBe(false);
    });
  });
});
