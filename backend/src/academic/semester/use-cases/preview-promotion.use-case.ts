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
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';
import { PromotionSemesterResolver } from '../services/promotion-semester-resolver.service.js';

@Injectable()
export class PreviewPromotionUseCase {
  constructor(
    private readonly promotionRepository: IPromotionRepository,
    private readonly semesterResolver: PromotionSemesterResolver,
  ) {}

  async execute(dto: PromotionDto): Promise<PromotionPreviewDto> {
    const { sourceAcademicYearId, targetAcademicYearId, students } = dto;

    // Which terms those years mean is the resolver's call, not the caller's.
    const { source: sourceSemester, target: targetSemester } =
      await this.semesterResolver.resolve(
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
