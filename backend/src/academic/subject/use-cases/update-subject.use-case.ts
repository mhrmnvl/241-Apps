import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSubjectDto } from '../dto/request/update-subject.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';

@Injectable()
export class UpdateSubjectUseCase {
  private readonly logger = new Logger(UpdateSubjectUseCase.name);

  constructor(private readonly repository: ISubjectRepository) {}

  async execute(id: string, dto: UpdateSubjectDto) {
    const existing = await this.repository.findById(id);
    if (!existing)
      throw new NotFoundException(`Subject with ID ${id} not found`);

    if (dto.name) {
      const dup = await this.repository.findByName(dto.name);
      if (dup && dup.id !== id)
        throw new ConflictException(`Subject "${dto.name}" already exists`);
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`Subject updated: ${id}`);
    return updated;
  }
}
