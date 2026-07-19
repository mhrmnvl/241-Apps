import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateClassroomDto } from '../dto/update-classroom.dto.js';
import { ClassroomRepository } from '../repositories/classroom.repository.js';
import { withDisplayName } from '../../../shared/utils/classroom-display-name.helper.js';

@Injectable()
export class UpdateClassroomUseCase {
  private readonly logger = new Logger(UpdateClassroomUseCase.name);

  constructor(private readonly repository: ClassroomRepository) {}

  async execute(id: string, dto: UpdateClassroomDto) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    const academicYearId = dto.academicYearId ?? current.academicYearId;
    const gradeId = dto.classroomLevelId ?? current.gradeId;
    const code = dto.code ?? current.code;

    const hasChanged =
      academicYearId !== current.academicYearId ||
      gradeId !== current.gradeId ||
      code !== current.code;

    if (hasChanged) {
      const duplicate = await this.repository.findDuplicate(
        academicYearId,
        gradeId,
        code,
        id,
      );
      if (duplicate) {
        throw new ConflictException(
          `Classroom code "${code}" already exists for this configuration`,
        );
      }
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`Class updated: ${id}`);
    return withDisplayName(updated);
  }
}
