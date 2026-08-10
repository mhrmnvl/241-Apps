import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaginatedResponse,
  PaginatedResult,
} from '../../../shared/domain/interfaces/repository.interface.js';
import { DeviceEntity } from '../domain/entities/device.entity.js';
import {
  DeviceQueryInput,
  IDeviceRepository,
} from '../domain/interfaces/device-repository.interface.js';
import { UpdateDeviceDto } from '../dto/request/update-device.dto.js';

function paginate<T>(result: PaginatedResult<T>): PaginatedResponse<T> {
  const { data, total, page, limit } = result;
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

@Injectable()
export class GetDevicesUseCase {
  constructor(private readonly deviceRepository: IDeviceRepository) {}

  /**
   * Exposes `lastSeenAt` deliberately. The realistic failure is nobody noticing
   * a gate has been offline since Tuesday, and a visible last-seen time is what
   * a petugas can act on.
   */
  async execute(
    query: DeviceQueryInput,
  ): Promise<PaginatedResponse<DeviceEntity>> {
    return paginate(await this.deviceRepository.findAll(query));
  }
}

@Injectable()
export class UpdateDeviceUseCase {
  constructor(private readonly deviceRepository: IDeviceRepository) {}

  async execute(id: string, dto: UpdateDeviceDto): Promise<DeviceEntity> {
    await this.assertExists(id);

    return this.deviceRepository.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
  }

  private async assertExists(id: string): Promise<void> {
    if (!(await this.deviceRepository.findById(id))) {
      throw new NotFoundException('Device not found');
    }
  }
}

@Injectable()
export class DeleteDeviceUseCase {
  constructor(private readonly deviceRepository: IDeviceRepository) {}

  /** Soft delete: the gate's scan history must survive the tablet. */
  async execute(id: string): Promise<DeviceEntity> {
    if (!(await this.deviceRepository.findById(id))) {
      throw new NotFoundException('Device not found');
    }

    return this.deviceRepository.softDelete(id);
  }
}
