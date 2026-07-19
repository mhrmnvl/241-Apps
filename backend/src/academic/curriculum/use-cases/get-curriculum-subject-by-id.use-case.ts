import { Injectable, NotFoundException } from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';

@Injectable()
export class GetCurriculumSubjectByIdUseCase {
  constructor(private readonly repository: ICurriculumSubjectRepository) {}

  async execute(id: string) {
    const result = await this.repository.findById(id);
    if (!result)
      throw new NotFoundException(`CurriculumSubject with ID ${id} not found`);
    return result;
  }
}
