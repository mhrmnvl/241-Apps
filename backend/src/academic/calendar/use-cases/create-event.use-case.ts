import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClassroomRepository } from '../../classroom/index.js';
import { CreateEventDto } from '../dto/request/create-event.dto.js';
import { IEventRepository } from '../domain/interfaces/events-repository.interface.js';

@Injectable()
export class CreateEventUseCase {
  private readonly logger = new Logger(CreateEventUseCase.name);

  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly ClassroomRepository: ClassroomRepository,
  ) {}

  async execute(dto: CreateEventDto) {
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

    const event = await this.eventRepository.create(dto);
    this.logger.log(
      `Event created: "${dto.title}" - targets: ${
        dto.classroomIds?.length ? dto.classroomIds.join(', ') : 'school-wide'
      }`,
    );
    return event;
  }
}
