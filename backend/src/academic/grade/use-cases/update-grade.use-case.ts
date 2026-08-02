import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateGradeDto } from '../dto/request/update-grade.dto.js';
import { IGradeRepository } from '../domain/interfaces/grade-repository.interface.js';

@Injectable()
export class UpdateGradeUseCase {
  private readonly logger = new Logger(UpdateGradeUseCase.name);

  constructor(private readonly gradeRepository: IGradeRepository) {}

  async execute(id: string, dto: UpdateGradeDto) {
    const current = await this.gradeRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Classroom level with ID ${id} not found`);
    }

    if (dto.level !== undefined && dto.level !== current.level) {
      const duplicate = await this.gradeRepository.findByLevel(dto.level);
      if (duplicate) {
        throw new ConflictException(
          `Classroom level ${dto.level} already exists`,
        );
      }
    }

    if (dto.name && dto.name !== current.name) {
      const duplicate = await this.gradeRepository.findByName(dto.name);
      if (duplicate) {
        throw new ConflictException(
          `Classroom level name "${dto.name}" already exists`,
        );
      }
    }

    const updated = await this.gradeRepository.update(id, dto);
    this.logger.log(`Classroom level updated: ${id}`);
    return updated;
  }
}
