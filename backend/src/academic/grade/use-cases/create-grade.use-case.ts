import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateGradeDto } from '../dto/request/create-grade.dto.js';
import { IGradeRepository } from '../domain/interfaces/grade-repository.interface.js';

@Injectable()
export class CreateGradeUseCase {
  private readonly logger = new Logger(CreateGradeUseCase.name);

  constructor(private readonly gradeRepository: IGradeRepository) {}

  async execute(dto: CreateGradeDto) {
    const existingLevel = await this.gradeRepository.findByLevel(dto.level);
    if (existingLevel) {
      throw new ConflictException(
        `Classroom level ${dto.level} already exists`,
      );
    }

    const existingName = await this.gradeRepository.findByName(dto.name);
    if (existingName) {
      throw new ConflictException(
        `Classroom level name "${dto.name}" already exists`,
      );
    }

    const created = await this.gradeRepository.create(dto);
    this.logger.log(`Classroom level created: ${created.id} (${created.name})`);
    return created;
  }
}
