import { Injectable, NotFoundException } from '@nestjs/common';
import { IStudentScoreRepository } from '../domain/interfaces/student-score-repository.interface.js';

@Injectable()
export class GetStudentScoreByIdUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoreRepository,
  ) {}
  async execute(id: string) {
    const r = await this.studentScoreRepository.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return r;
  }
}
