import { Injectable, NotFoundException } from '@nestjs/common';
import { IStudentScoresRepository } from '../domain/interfaces/student-scores-repository.interface.js';
import { UpdateStudentScoreDto } from '../dto/request/update-student-score.dto.js';

@Injectable()
export class UpdateStudentScoreUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
  ) {}
  async execute(id: string, dto: UpdateStudentScoreDto) {
    const r = await this.studentScoreRepository.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return this.studentScoreRepository.update(id, dto);
  }
}
