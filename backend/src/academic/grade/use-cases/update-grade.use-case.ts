import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateGradeDto } from '../dto/update-grade.dto.js';
import { IClassroomLevelsRepository } from '../domain/interfaces/classroom-levels-repository.interface.js';

@Injectable()
export class UpdateClassroomLevelUseCase {
  private readonly logger = new Logger(UpdateClassroomLevelUseCase.name);

  constructor(private readonly repository: IClassroomLevelsRepository) {}

  async execute(id: string, dto: UpdateGradeDto) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`Classroom level with ID ${id} not found`);
    }

    if (dto.level !== undefined && dto.level !== current.level) {
      const duplicate = await this.repository.findByLevel(dto.level);
      if (duplicate) {
        throw new ConflictException(
          `Classroom level ${dto.level} already exists`,
        );
      }
    }

    if (dto.name && dto.name !== current.name) {
      const duplicate = await this.repository.findByName(dto.name);
      if (duplicate) {
        throw new ConflictException(
          `Classroom level name "${dto.name}" already exists`,
        );
      }
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`Classroom level updated: ${id}`);
    return updated;
  }
}
