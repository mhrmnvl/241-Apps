import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PromotionAction } from '../domain/enums/promotion-action.enum.js';
import { PromotionDto } from '../dto/request/promotion.dto.js';
import {
  PromotionPreviewDto,
  PromotionPreviewItemDto,
} from '../dto/response/promotion-preview.dto.js';
import { PromotionSemesterResolver } from '../services/promotion-semester-resolver.service.js';

@Injectable()
export class PreviewPromotionUseCase {
  constructor(private readonly semesterResolver: PromotionSemesterResolver) {}

  /**
   * Synchronous, because it is. A preview counts up the decisions it was
   * handed — it reads no semester, no classroom and no enrolment — so there is
   * nothing to await. The controller returning it into a promise is unchanged.
   */
  execute(dto: PromotionDto): PromotionPreviewDto {
    const { sourceAcademicYearId, targetAcademicYearId, students } = dto;

    // Nothing here reads a term. A preview counts up the decisions it was
    // handed, so the only thing worth refusing is a pair of years that is not
    // a promotion at all.
    this.semesterResolver.assertDifferentYears(
      sourceAcademicYearId,
      targetAcademicYearId,
    );

    let promotedCount = 0;
    let repeatedCount = 0;

    const actionCounts = new Map<PromotionAction, number>();

    for (const student of students) {
      const current = actionCounts.get(student.action) ?? 0;
      actionCounts.set(student.action, current + 1);

      switch (student.action) {
        case PromotionAction.PROMOTE:
          promotedCount++;
          break;
        case PromotionAction.REPEAT:
          repeatedCount++;
          break;
      }
    }

    const items: PromotionPreviewItemDto[] = [];
    for (const [action, count] of actionCounts) {
      items.push({ action, studentCount: count });
    }

    return {
      items,
      totalStudents: students.length,
      promotedCount,
      repeatedCount,
    };
  }
}
