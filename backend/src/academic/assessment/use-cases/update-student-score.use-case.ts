import { Injectable, NotFoundException } from '@nestjs/common';
import { IStudentScoreRepository } from '../domain/interfaces/student-score-repository.interface.js';
import { UpdateStudentScoreDto } from '../dto/request/update-student-score.dto.js';

@Injectable()
export class UpdateStudentScoreUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoreRepository,
  ) {}
  async execute(id: string, dto: UpdateStudentScoreDto) {
    const r = await this.studentScoreRepository.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    // Only the score and note are editable; the enrolment and assessment item
    // a score belongs to are fixed once created.
    return this.studentScoreRepository.update(id, {
      score: dto.score,
      note: dto.note,
    });
  }
}
