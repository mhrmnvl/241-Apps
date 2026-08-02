import { Injectable } from '@nestjs/common';
import { TimeSlot, TimeSlotType } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  TimeSlotQueryInput,
  CreateTimeSlotRepositoryInput,
  UpdateTimeSlotRepositoryInput,
  CreateTimeSlotTypeRepositoryInput,
  UpdateTimeSlotTypeRepositoryInput,
} from '../../domain/interfaces/time-slot-repository.interface.js';
import { ITimeSlotRepository } from '../../domain/interfaces/time-slot-repository.interface.js';
import {
  TIME_SLOT_WITH_TYPE_INCLUDE,
  TimeSlotWithType,
} from './prisma-time-slot.includes.js';

@Injectable()
export class PrismaTimeSlotRepository extends ITimeSlotRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private toDateTime(timeStr: string): Date {
    return new Date(`1970-01-01T${timeStr}:00.000Z`);
  }

  async findAll(query?: TimeSlotQueryInput) {
    const data = await this.prisma.timeSlot.findMany({
      where: { deletedAt: null },
      include: TIME_SLOT_WITH_TYPE_INCLUDE,
      orderBy: { order: 'asc' },
    });
    return { data, total: data.length, page: 1, limit: data.length || 10 };
  }

  async findAllTypes(): Promise<TimeSlotType[]> {
    return this.prisma.timeSlotType.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findTypeById(id: string): Promise<TimeSlotType | null> {
    return this.prisma.timeSlotType.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findTypeByCode(
    code: string,
    excludeId?: string,
  ): Promise<TimeSlotType | null> {
    return this.prisma.timeSlotType.findFirst({
      where: {
        code,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  async createType(
    dto: CreateTimeSlotTypeRepositoryInput,
  ): Promise<TimeSlotType> {
    return this.prisma.timeSlotType.create({
      data: {
        code: dto.code,
        name: dto.name,
        isLesson: dto.isLesson ?? true,
        days: dto.days ?? [],
      },
    });
  }

  async updateType(
    id: string,
    dto: UpdateTimeSlotTypeRepositoryInput,
  ): Promise<TimeSlotType> {
    return this.prisma.timeSlotType.update({
      where: { id },
      data: {
        ...(dto.code && { code: dto.code }),
        ...(dto.name && { name: dto.name }),
        ...(dto.isLesson !== undefined && { isLesson: dto.isLesson }),
        ...(dto.days !== undefined && { days: dto.days }),
      },
    });
  }

  async removeType(id: string): Promise<TimeSlotType> {
    return this.prisma.timeSlotType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countSlotsUsingType(typeId: string): Promise<number> {
    return this.prisma.timeSlot.count({
      where: { typeId, deletedAt: null },
    });
  }

  async findById(id: string): Promise<TimeSlotWithType | null> {
    return this.prisma.timeSlot.findFirst({
      where: { id, deletedAt: null },
      include: TIME_SLOT_WITH_TYPE_INCLUDE,
    });
  }

  async findByOrder(
    order: number,
    excludeId?: string,
  ): Promise<TimeSlotWithType | null> {
    return this.prisma.timeSlot.findFirst({
      where: {
        order,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
      include: TIME_SLOT_WITH_TYPE_INCLUDE,
    });
  }

  async findOverlappingSlot(
    typeId: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<TimeSlotWithType | null> {
    return this.prisma.timeSlot.findFirst({
      where: {
        typeId,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      include: TIME_SLOT_WITH_TYPE_INCLUDE,
    });
  }

  async create(dto: CreateTimeSlotRepositoryInput): Promise<TimeSlotWithType> {
    return this.prisma.timeSlot.create({
      data: {
        name: dto.name,
        startTime: this.toDateTime(dto.startTime),
        endTime: this.toDateTime(dto.endTime),
        order: dto.order,
        typeId: dto.typeId,
      },
      include: TIME_SLOT_WITH_TYPE_INCLUDE,
    });
  }

  async update(
    id: string,
    dto: UpdateTimeSlotRepositoryInput,
  ): Promise<TimeSlotWithType> {
    return this.prisma.timeSlot.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.startTime && { startTime: this.toDateTime(dto.startTime) }),
        ...(dto.endTime && { endTime: this.toDateTime(dto.endTime) }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.typeId !== undefined && { typeId: dto.typeId }),
      },
      include: TIME_SLOT_WITH_TYPE_INCLUDE,
    });
  }

  async remove(id: string): Promise<TimeSlot> {
    return this.prisma.timeSlot.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countSchedulesWithTimeSlot(timeSlotId: string): Promise<number> {
    return this.prisma.schedule.count({
      where: {
        timeSlotId,
        deletedAt: null,
      },
    });
  }

  async countSchedulesUsing(timeSlotId: string): Promise<number> {
    return this.countSchedulesWithTimeSlot(timeSlotId);
  }
}
