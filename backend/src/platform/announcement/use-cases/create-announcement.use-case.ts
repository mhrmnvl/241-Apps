import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IClassroomRepository } from '../../../academic/classroom/index.js';
import { CreateAnnouncementDto } from '../dto/request/create-announcement.dto.js';
import { IAnnouncementRepository } from '../domain/interfaces/announcement-repository.interface.js';

@Injectable()
export class CreateAnnouncementUseCase {
  private readonly logger = new Logger(CreateAnnouncementUseCase.name);

  constructor(
    private readonly announcementRepository: IAnnouncementRepository,
    private readonly ClassroomRepository: IClassroomRepository,
  ) {}

  async execute(dto: CreateAnnouncementDto) {
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

    const announcement = await this.announcementRepository.create({
      title: dto.title,
      description: dto.description,
      date: new Date(dto.date),
      classroomIds: dto.classroomIds,
    });

    this.logger.log(
      `Announcement created: "${dto.title}" – targets: ${
        dto.classroomIds?.length ? dto.classroomIds.join(', ') : 'school-wide'
      }`,
    );
    return announcement;
  }
}
