import { Injectable } from '@nestjs/common';
import { TimeSlot } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateTimeSlotDto } from '../../dto/create-time-slot.dto.js';
import { UpdateTimeSlotDto } from '../../dto/update-time-slot.dto.js';
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
