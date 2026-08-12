import { Injectable } from '@nestjs/common';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { BulkCreateCurriculumSubjectDto } from '../dto/request/bulk-create-curriculum-subject.dto.js';

export interface BulkCreateResult {
  created: number;
  skipped: number;
}

@Injectable()
export class BulkCreateCurriculumSubjectsUseCase {
  constructor(
    private readonly curriculumSubjectRepository: ICurriculumSubjectRepository,
  ) {}

  async execute(
    dto: BulkCreateCurriculumSubjectDto,
  ): Promise<BulkCreateResult> {
    let created = 0;
    let skipped = 0;

    for (const item of dto.items) {
      // Skip if duplicate already exists (active)
      const existing = await this.curriculumSubjectRepository.findDuplicate(
        item.curriculumId,
        item.subjectId,
      );
      if (existing) {
        skipped++;
        continue;
      }

      // Restore soft-deleted record if present, otherwise create new
      const softDeleted =
        await this.curriculumSubjectRepository.findSoftDeleted(
          item.curriculumId,
          item.subjectId,
        );
      if (softDeleted) {
        await this.curriculumSubjectRepository.restore(softDeleted.id, {
          hoursPerWeek: item.hoursPerWeek,
          passingScore: item.passingScore,
        });
      } else {
        await this.curriculumSubjectRepository.create({
          curriculumId: item.curriculumId,
          subjectId: item.subjectId,
          hoursPerWeek: item.hoursPerWeek,
          passingScore: item.passingScore,
        });
      }
      created++;
    }

    return { created, skipped };
  }
}
