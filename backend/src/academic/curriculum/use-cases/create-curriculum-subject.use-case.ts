import { ConflictException, Injectable } from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { CreateCurriculumSubjectDto } from '../dto/create-curriculum-subject.dto.js';

@Injectable()
export class CreateCurriculumSubjectUseCase {
  constructor(private readonly repository: ICurriculumSubjectRepository) {}

  async execute(dto: CreateCurriculumSubjectDto) {
    const existing = await this.repository.findDuplicate(
      dto.curriculumId,
      dto.gradeId,
      dto.subjectId,
    );
    if (existing) {
      throw new ConflictException(
        'This subject is already assigned to this curriculum and grade level',
      );
    }

    const softDeleted = await this.repository.findSoftDeleted(
      dto.curriculumId,
      dto.gradeId,
      dto.subjectId,
    );
    if (softDeleted) {
      return this.repository.restore(softDeleted.id, {
        hoursPerWeek: dto.hoursPerWeek,
      });
    }

    return this.repository.create(dto);
  }
}
