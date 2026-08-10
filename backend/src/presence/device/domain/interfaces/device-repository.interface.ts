import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { DeviceAuthContext, DeviceEntity } from '../entities/device.entity.js';

export type { DeviceAuthContext };

export interface DeviceQueryInput extends PaginationQueryInput {
  isActive?: boolean;
  search?: string;
}

export interface CreateDeviceRepositoryInput {
  name: string;
  location?: string | null;
  tokenHash: string;
  tokenIssuedAt: Date;
}

export interface UpdateDeviceRepositoryInput {
  name?: string;
  location?: string | null;
  isActive?: boolean;
}

export interface RotateDeviceTokenRepositoryInput {
  tokenHash: string;
  tokenIssuedAt: Date;
}

export abstract class IDeviceRepository {
  abstract findAll(
    query: DeviceQueryInput,
  ): Promise<PaginatedResult<DeviceEntity>>;
  abstract findById(id: string): Promise<DeviceEntity | null>;
  /** The guard's only query. Indexed on the hash, so it is one lookup. */
  abstract findByTokenHash(
    tokenHash: string,
  ): Promise<DeviceAuthContext | null>;
  abstract create(input: CreateDeviceRepositoryInput): Promise<DeviceEntity>;
  abstract update(
    id: string,
    input: UpdateDeviceRepositoryInput,
  ): Promise<DeviceEntity>;
  abstract rotateToken(
    id: string,
    input: RotateDeviceTokenRepositoryInput,
  ): Promise<DeviceEntity>;
  abstract softDelete(id: string): Promise<DeviceEntity>;
  /** Called on every accepted scan; how a silent gate becomes visible. */
  abstract touchLastSeen(id: string, at: Date): Promise<void>;
}
