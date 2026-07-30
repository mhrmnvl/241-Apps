import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSubjectDto } from '../dto/request/create-subject.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';

@Injectable()
export class CreateSubjectUseCase {
  private readonly logger = new Logger(CreateSubjectUseCase.name);

  constructor(private readonly repository: ISubjectRepository) {}

  async execute(dto: CreateSubjectDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing)
      throw new ConflictException(`Subject "${dto.name}" already exists`);

    const subject = await this.repository.create(dto);
    this.logger.log(`Subject created: ${dto.name}`);
    return subject;
  }
}
