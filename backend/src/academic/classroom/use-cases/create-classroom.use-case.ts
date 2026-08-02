import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateClassroomDto } from '../dto/request/create-classroom.dto.js';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { withDisplayName } from '../../../shared/utils/classroom-display-name.helper.js';

@Injectable()
export class CreateClassroomUseCase {
  private readonly logger = new Logger(CreateClassroomUseCase.name);

  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(dto: CreateClassroomDto) {
    const existing = await this.classroomRepository.findDuplicate(
      dto.code,
      dto.academicYearId,
    );
    if (existing) {
      throw new ConflictException(
        `Classroom code "${dto.code}" already exists for this academic year and level`,
      );
    }

    const newClassroom = await this.classroomRepository.create({
      academicYearId: dto.academicYearId,
      gradeId: dto.gradeId,
      code: dto.code,
      name: dto.name,
      capacity: dto.capacity,
      isActive: dto.isActive,
    });

    this.logger.log(`Classroom created: ${dto.code}`);
    return withDisplayName(newClassroom);
  }
}
