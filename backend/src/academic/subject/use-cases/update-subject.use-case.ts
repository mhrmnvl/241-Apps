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

  constructor(private readonly subjectRepository: ISubjectRepository) {}

  async execute(id: string, dto: UpdateSubjectDto) {
    const existing = await this.subjectRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`Subject with ID ${id} not found`);

    if (dto.name) {
      const dup = await this.subjectRepository.findByName(dto.name);
      if (dup && dup.id !== id)
        throw new ConflictException(`Subject "${dto.name}" already exists`);
    }

    // Explicit mapping — see CreateSubjectUseCase for why the DTO is not
    // forwarded wholesale.
    const updated = await this.subjectRepository.update(id, {
      code: dto.code,
      name: dto.name,
      kkm: dto.kkm,
    });
    this.logger.log(`Subject updated: ${id}`);
    return updated;
  }
}
