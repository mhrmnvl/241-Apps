import { Injectable } from '@nestjs/common';
import { IAssetUnitRepository } from '../domain/interfaces/asset-unit-repository.interface.js';
import { AssetUnitQueryDto } from '../dto/request/asset-unit-query.dto.js';

/**
 * Lists asset units, optionally narrowed to the ones that may be lent.
 *
 * The loan form used to answer that itself: it read a thousand assets with
 * every unit attached and kept the ones whose status allowed transactions. The
 * rule was already enforced on submit, in `CreateLoanUseCase`, so the browser
 * held a second copy of it — and two copies of one rule is how the inventory
 * approval and rejection paths came to disagree.
 */
@Injectable()
export class GetAssetUnitsUseCase {
  constructor(private readonly assetUnitRepository: IAssetUnitRepository) {}

  async execute(query: AssetUnitQueryDto) {
    return this.assetUnitRepository.findAll({
      page: query.page,
      limit: query.limit,
      lendable: query.lendable,
      search: query.search,
    });
  }
}
