import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { UpdateCurriculumSubjectDto } from '../dto/update-curriculum-subject.dto.js';

@Injectable()
export class UpdateCurriculumSubjectUseCase {
  constructor(private readonly repository: ICurriculumSubjectRepository) {}

  async execute(id: string, dto: UpdateCurriculumSubjectDto) {
    const current = await this.repository.findById(id);
    if (!current)
      throw new NotFoundException(`CurriculumSubject with ID ${id} not found`);

    const curriculumId = dto.curriculumId ?? current.curriculumId;
    const subjectId = dto.subjectId ?? current.subjectId;

    if (
      curriculumId !== current.curriculumId ||
      subjectId !== current.subjectId
    ) {
      const duplicate = await this.repository.findDuplicate(
        curriculumId,
        subjectId,
        id,
      );
      if (duplicate)
        throw new ConflictException(
          'This subject is already assigned to this curriculum',
        );
    }

    return this.repository.update(id, dto);
  }
}
