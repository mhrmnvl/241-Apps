import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { UpdateCurriculumSubjectDto } from '../dto/request/update-curriculum-subject.dto.js';

@Injectable()
export class UpdateCurriculumSubjectUseCase {
  constructor(
    private readonly curriculumSubjectRepository: ICurriculumSubjectRepository,
  ) {}

  async execute(id: string, dto: UpdateCurriculumSubjectDto) {
    const current = await this.curriculumSubjectRepository.findById(id);
    if (!current)
      throw new NotFoundException(`CurriculumSubject with ID ${id} not found`);

    const curriculumId =
      dto.curriculumId ?? current.curriculumId ?? current.curriculaId ?? '';
    const subjectId = dto.subjectId ?? current.subjectId;

    if (
      curriculumId !== current.curriculumId ||
      subjectId !== current.subjectId
    ) {
      const duplicate = await this.curriculumSubjectRepository.findDuplicate(
        curriculumId,
        subjectId,
        id,
      );
      if (duplicate)
        throw new ConflictException(
          'This subject is already assigned to this curriculum',
        );
    }

    // `gradeId` is absent from the update DTO on purpose: the grade a subject
    // sits in is decided when it is added to the curriculum.
    return this.curriculumSubjectRepository.update(id, {
      curriculumId: dto.curriculumId,
      subjectId: dto.subjectId,
      hoursPerWeek: dto.hoursPerWeek,
    });
  }
}
