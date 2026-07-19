import { Injectable, NotFoundException } from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';

@Injectable()
export class DeleteCurriculumSubjectUseCase {
  constructor(private readonly repository: ICurriculumSubjectRepository) {}

  async execute(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing)
      throw new NotFoundException(`CurriculumSubject with ID ${id} not found`);
    return this.repository.softDelete(id);
  }
}
