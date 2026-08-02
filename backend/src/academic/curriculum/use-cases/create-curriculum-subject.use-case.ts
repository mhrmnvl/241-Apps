import { ConflictException, Injectable } from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { CreateCurriculumSubjectDto } from '../dto/request/create-curriculum-subject.dto.js';

@Injectable()
export class CreateCurriculumSubjectUseCase {
  constructor(
    private readonly curriculumSubjectRepository: ICurriculumSubjectRepository,
  ) {}

  async execute(dto: CreateCurriculumSubjectDto) {
    const existing = await this.curriculumSubjectRepository.findDuplicate(
      dto.curriculumId,
      dto.subjectId,
    );
    if (existing) {
      throw new ConflictException(
        'This subject is already assigned to this curriculum',
      );
    }

    const softDeleted = await this.curriculumSubjectRepository.findSoftDeleted(
      dto.curriculumId,
      dto.subjectId,
    );
    if (softDeleted) {
      return this.curriculumSubjectRepository.restore(softDeleted.id, {
        hoursPerWeek: dto.hoursPerWeek,
      });
    }

    return this.curriculumSubjectRepository.create({
      curriculumId: dto.curriculumId,
      subjectId: dto.subjectId,
      hoursPerWeek: dto.hoursPerWeek,
    });
  }
}
