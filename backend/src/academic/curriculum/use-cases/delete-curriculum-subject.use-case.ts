import { Injectable, NotFoundException } from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';

@Injectable()
export class DeleteCurriculumSubjectUseCase {
  constructor(
    private readonly curriculumSubjectRepository: ICurriculumSubjectRepository,
  ) {}

  async execute(id: string) {
    const existing = await this.curriculumSubjectRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`CurriculumSubject with ID ${id} not found`);
    return this.curriculumSubjectRepository.softDelete(id);
  }
}
