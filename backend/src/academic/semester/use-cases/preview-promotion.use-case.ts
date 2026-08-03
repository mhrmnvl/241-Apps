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

@Injectable()
export class PreviewPromotionUseCase {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async execute(dto: PromotionDto): Promise<PromotionPreviewDto> {
    const { sourceSemesterId, targetSemesterId, students } = dto;

    if (sourceSemesterId === targetSemesterId) {
      throw new BadRequestException(
        'Source and target semester must be different',
      );
    }

    const [sourceSemester, targetSemester] = await Promise.all([
      this.promotionRepository.findSemesterWithAcademicYear(sourceSemesterId),
      this.promotionRepository.findSemesterWithAcademicYear(targetSemesterId),
    ]);

    if (!sourceSemester) {
      throw new NotFoundException(
        `Source semester with ID ${sourceSemesterId} not found`,
      );
    }
    if (!targetSemester) {
      throw new NotFoundException(
        `Target semester with ID ${targetSemesterId} not found`,
      );
    }

    if (sourceSemester.academicYearId === targetSemester.academicYearId) {
      throw new BadRequestException(
        'Promotion requires different academic years. Use rollover for same academic year transitions.',
      );
    }

    let promotedCount = 0;
    let repeatedCount = 0;
    let graduatedCount = 0;

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
        case PromotionAction.GRADUATE:
          graduatedCount++;
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
      graduatedCount,
    };
  }
}
