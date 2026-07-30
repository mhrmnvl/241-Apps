import { Injectable, NotFoundException } from '@nestjs/common';
import { IStudentScoresRepository } from '../domain/interfaces/student-scores-repository.interface.js';

@Injectable()
export class DeleteStudentScoreUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
  ) {}
  async execute(id: string) {
    const r = await this.studentScoreRepository.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return this.studentScoreRepository.softDelete(id);
  }
}
