import { Injectable } from '@nestjs/common';
import {
  PaginatedResponse,
  PaginatedResult,
} from '../../../shared/domain/interfaces/repository.interface.js';
import {
  ClockAnchor,
  ServerClockService,
} from '../../shared/services/server-clock.service.js';
import {
  IScanRepository,
  ScanQueryInput,
  ScanWithDevice,
} from '../domain/interfaces/scan-repository.interface.js';

function paginate<T>(result: PaginatedResult<T>): PaginatedResponse<T> {
  const { data, total, page, limit } = result;
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

@Injectable()
export class GetScansUseCase {
  constructor(private readonly scans: IScanRepository) {}

  /** The evidence log, rejections included (FR-003). */
  async execute(
    query: ScanQueryInput,
  ): Promise<PaginatedResponse<ScanWithDevice>> {
    return paginate(await this.scans.findAll(query));
  }
}

@Injectable()
export class GetClockAnchorUseCase {
  constructor(private readonly clock: ServerClockService) {}

  /** What the device pins its monotonic counter to before going offline. */
  execute(): ClockAnchor {
    return this.clock.issueAnchor();
  }
}
