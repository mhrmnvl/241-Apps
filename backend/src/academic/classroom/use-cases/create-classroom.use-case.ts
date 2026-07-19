import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateClassroomDto } from '../dto/create-classroom.dto.js';
import { ClassroomRepository } from '../repositories/classroom.repository.js';
import { withDisplayName } from '../../../shared/utils/classroom-display-name.helper.js';

@Injectable()
export class CreateClassroomUseCase {
  private readonly logger = new Logger(CreateClassroomUseCase.name);

  constructor(private readonly repository: ClassroomRepository) {}

  async execute(dto: CreateClassroomDto) {
    const existing = await this.repository.findDuplicate(
      dto.academicYearId,
      dto.gradeId,
      dto.code,
    );
    if (existing) {
      throw new ConflictException(
        `Classroom code "${dto.code}" already exists for this academic year and level`,
      );
    }

    const newClassroom = await this.repository.create({
      curriculumId: dto.curriculumId,
      academicYearId: dto.academicYearId,
      gradeId: dto.gradeId,
      code: dto.code,
      name: dto.name ?? null,
      capacity: dto.capacity,
      isActive: dto.isActive,
    });

    this.logger.log(`Classroom created: ${dto.code}`);
    return withDisplayName(newClassroom);
  }
}
