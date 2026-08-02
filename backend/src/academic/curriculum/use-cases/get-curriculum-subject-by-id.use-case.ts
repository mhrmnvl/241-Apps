import { Injectable, NotFoundException } from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';

@Injectable()
export class GetCurriculumSubjectByIdUseCase {
  constructor(
    private readonly curriculumSubjectRepository: ICurriculumSubjectRepository,
  ) {}

  async execute(id: string) {
    const result = await this.curriculumSubjectRepository.findById(id);
    if (!result)
      throw new NotFoundException(`CurriculumSubject with ID ${id} not found`);
    return result;
  }
}
