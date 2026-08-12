import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-item-repository.interface.js';
import { IStudentScoreRepository } from '../domain/interfaces/student-score-repository.interface.js';
import { UpdateStudentScoreDto } from '../dto/request/update-student-score.dto.js';
import { assertScoreInRange } from '../services/assert-score-in-range.js';

@Injectable()
export class UpdateStudentScoreUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoreRepository,
    private readonly assessmentItemRepository: IAssessmentItemRepository,
  ) {}
  async execute(id: string, dto: UpdateStudentScoreDto) {
    const r = await this.studentScoreRepository.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);

    // Checked against the item this score already belongs to, which is fixed —
    // so editing a mark cannot slip past the bound its creation was held to.
    const assessmentItem = r.assessmentItemId
      ? await this.assessmentItemRepository.findById(r.assessmentItemId)
      : null;
    assertScoreInRange(dto.score, assessmentItem?.maxScore);

    // Only the score and note are editable; the enrolment and assessment item
    // a score belongs to are fixed once created.
    return this.studentScoreRepository.update(id, {
      score: dto.score,
      note: dto.note,
    });
  }
}
