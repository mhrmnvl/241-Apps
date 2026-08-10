import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  DeviceAuthContext,
  DeviceEntity,
} from '../../domain/entities/device.entity.js';
import {
  CreateDeviceRepositoryInput,
  DeviceQueryInput,
  IDeviceRepository,
  RotateDeviceTokenRepositoryInput,
  UpdateDeviceRepositoryInput,
} from '../../domain/interfaces/device-repository.interface.js';

/** `tokenHash` is excluded everywhere — it must never reach a response. */
const DEVICE_SELECT = {
  id: true,
  name: true,
  location: true,
  isActive: true,
  lastSeenAt: true,
  tokenIssuedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PresenceDeviceSelect;

@Injectable()
export class PrismaDeviceRepository implements IDeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: DeviceQueryInput,
  ): Promise<PaginatedResult<DeviceEntity>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.PresenceDeviceWhereInput = {
      deletedAt: null,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.presenceDevice.findMany({
        where,
        select: DEVICE_SELECT,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.presenceDevice.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<DeviceEntity | null> {
    return this.prisma.presenceDevice.findFirst({
      where: { id, deletedAt: null },
      select: DEVICE_SELECT,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<DeviceAuthContext | null> {
    return this.prisma.presenceDevice.findFirst({
      where: { tokenHash, deletedAt: null },
      select: { id: true, name: true, isActive: true },
    });
  }

  async create(input: CreateDeviceRepositoryInput): Promise<DeviceEntity> {
    return this.prisma.presenceDevice.create({
      data: input,
      select: DEVICE_SELECT,
    });
  }

  async update(
    id: string,
    input: UpdateDeviceRepositoryInput,
  ): Promise<DeviceEntity> {
    return this.prisma.presenceDevice.update({
      where: { id },
      data: input,
      select: DEVICE_SELECT,
    });
  }

  async rotateToken(
    id: string,
    input: RotateDeviceTokenRepositoryInput,
  ): Promise<DeviceEntity> {
    return this.prisma.presenceDevice.update({
      where: { id },
      data: input,
      select: DEVICE_SELECT,
    });
  }

  async softDelete(id: string): Promise<DeviceEntity> {
    return this.prisma.presenceDevice.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: DEVICE_SELECT,
    });
  }

  /**
   * Fire-and-forget from the scan path's point of view: a failure to record
   * that a gate is alive must never fail the scan that proved it.
   */
  async touchLastSeen(id: string, at: Date): Promise<void> {
    await this.prisma.presenceDevice.update({
      where: { id },
      data: { lastSeenAt: at },
      select: { id: true },
    });
  }
}
