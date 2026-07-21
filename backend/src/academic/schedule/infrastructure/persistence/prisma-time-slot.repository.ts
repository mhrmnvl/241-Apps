import { Injectable } from '@nestjs/common';
import { TimeSlot, TimeSlotType } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateTimeSlotDto } from '../../dto/request/create-time-slot.dto.js';
import { UpdateTimeSlotDto } from '../../dto/request/update-time-slot.dto.js';
import { CreateTimeSlotTypeDto } from '../../dto/request/create-time-slot-type.dto.js';
import { UpdateTimeSlotTypeDto } from '../../dto/request/update-time-slot-type.dto.js';
import {
  ITimeSlotRepository,
  TIME_SLOT_INCLUDE,
  TimeSlotWithDetails,
} from '../../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class PrismaTimeSlotRepository extends ITimeSlotRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private toDateTime(timeStr: string): Date {
    return new Date(`1970-01-01T${timeStr}:00.000Z`);
  }

  async findAll(): Promise<TimeSlotWithDetails[]> {
    return this.prisma.timeSlot.findMany({
      where: { deletedAt: null },
      include: TIME_SLOT_INCLUDE,
      orderBy: { order: 'asc' },
    });
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

  async createType(dto: CreateTimeSlotTypeDto): Promise<TimeSlotType> {
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
    dto: UpdateTimeSlotTypeDto,
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

  async findById(id: string): Promise<TimeSlotWithDetails | null> {
    return this.prisma.timeSlot.findFirst({
      where: { id, deletedAt: null },
      include: TIME_SLOT_INCLUDE,
    });
  }

  async findByOrder(
    order: number,
    excludeId?: string,
  ): Promise<TimeSlotWithDetails | null> {
    return this.prisma.timeSlot.findFirst({
      where: {
        order,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
      include: TIME_SLOT_INCLUDE,
    });
  }

  async create(dto: CreateTimeSlotDto): Promise<TimeSlotWithDetails> {
    return this.prisma.timeSlot.create({
      data: {
        name: dto.name,
        startTime: this.toDateTime(dto.startTime),
        endTime: this.toDateTime(dto.endTime),
        order: dto.order,
        typeId: dto.typeId,
      },
      include: TIME_SLOT_INCLUDE,
    });
  }

  async update(
    id: string,
    dto: UpdateTimeSlotDto,
  ): Promise<TimeSlotWithDetails> {
    return this.prisma.timeSlot.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.startTime && { startTime: this.toDateTime(dto.startTime) }),
        ...(dto.endTime && { endTime: this.toDateTime(dto.endTime) }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.typeId !== undefined && { typeId: dto.typeId }),
      },
      include: TIME_SLOT_INCLUDE,
    });
  }

  async remove(id: string): Promise<TimeSlot> {
    return this.prisma.timeSlot.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countSchedulesUsing(timeSlotId: string): Promise<number> {
    return this.prisma.schedule.count({
      where: {
        timeSlotId,
        deletedAt: null,
      },
    });
  }
}
