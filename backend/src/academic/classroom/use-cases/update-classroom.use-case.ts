import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateClassroomDto } from '../dto/request/update-classroom.dto.js';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { withDisplayName } from '../../../shared/utils/classroom-display-name.helper.js';

@Injectable()
export class UpdateClassroomUseCase {
  private readonly logger = new Logger(UpdateClassroomUseCase.name);

  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(id: string, dto: UpdateClassroomDto) {
    const current = await this.classroomRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    const academicYearId = dto.academicYearId ?? current.academicYearId;
    const code = dto.code ?? current.code;

    const hasChanged =
      academicYearId !== current.academicYearId || code !== current.code;

    if (hasChanged) {
      const duplicate = await this.classroomRepository.findDuplicate(
        code,
        academicYearId,
        id,
      );
      if (duplicate) {
        throw new ConflictException(
          `Classroom code "${code}" already exists for this configuration`,
        );
      }
    }

    const updated = await this.classroomRepository.update(id, {
      academicYearId: dto.academicYearId,
      gradeId: dto.gradeId,
      code: dto.code,
      name: dto.name,
      capacity: dto.capacity,
      isActive: dto.isActive,
    });
    this.logger.log(`Class updated: ${id}`);
    return withDisplayName(updated);
  }
}
