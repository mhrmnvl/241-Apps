import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IClassroomRepository } from '../../classroom/index.js';
import { UpdateEventDto } from '../dto/request/update-event.dto.js';
import { IEventRepository } from '../domain/interfaces/event-repository.interface.js';

@Injectable()
export class UpdateEventUseCase {
  private readonly logger = new Logger(UpdateEventUseCase.name);

  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly ClassroomRepository: IClassroomRepository,
  ) {}

  async execute(id: string, dto: UpdateEventDto) {
    const current = await this.eventRepository.findById(id);
    if (!current) throw new NotFoundException(`Event with ID ${id} not found`);

    if (dto.classroomIds?.length) {
      for (const classroomId of dto.classroomIds) {
        const classObj = await this.ClassroomRepository.findById(classroomId);
        if (!classObj) {
          throw new NotFoundException(
            `Classroom with ID ${classroomId} not found`,
          );
        }
      }
    }

    const { startTime, endTime, ...rest } = dto;
    const updated = await this.eventRepository.update(id, {
      ...rest,
      ...(startTime !== undefined && { startTime: new Date(startTime) }),
      ...(endTime !== undefined && { endTime: new Date(endTime) }),
    });
    this.logger.log(`Event updated: ${id}`);
    return updated;
  }
}
