import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateSubjectDto } from '../dto/request/create-subject.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';

@Injectable()
export class CreateSubjectUseCase {
  private readonly logger = new Logger(CreateSubjectUseCase.name);

  constructor(private readonly subjectRepository: ISubjectRepository) {}

  async execute(dto: CreateSubjectDto) {
    const existing = await this.subjectRepository.findByName(dto.name);
    if (existing)
      throw new ConflictException(`Subject "${dto.name}" already exists`);

    // Mapped field by field rather than forwarding the DTO. The two shapes are
    // structurally compatible, so a new DTO field would otherwise reach the
    // repository unnoticed — which is how `teacherIds` once slipped through and
    // started assigning teachers to every classroom.
    const subject = await this.subjectRepository.create({
      code: dto.code,
      name: dto.name,
      passingScore: dto.passingScore,
    });
    this.logger.log(`Subject created: ${dto.name}`);
    return subject;
  }
}
