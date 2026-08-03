import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GenerateRecommendationDto } from '../dto/request/generate-recommendation.dto.js';
import {
  PromotionRecommendationDto,
  PromotionRecommendationItemDto,
} from '../dto/response/promotion-recommendation.dto.js';
import { PromotionAction } from '../domain/enums/promotion-action.enum.js';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';

@Injectable()
export class GeneratePromotionRecommendationUseCase {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async execute(
    dto: GenerateRecommendationDto,
  ): Promise<PromotionRecommendationDto> {
    const { sourceSemesterId, targetSemesterId } = dto;

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

    const [enrollments, targetClassrooms] = await Promise.all([
      this.promotionRepository.findActiveEnrollmentsWithDetails(
        sourceSemesterId,
      ),
      this.promotionRepository.findClassesByAcademicYear(
        targetSemester.academicYearId,
      ),
    ]);

    // Build a map of level (int) → next level's classrooms
    const levelSet = new Set(targetClassrooms.map((c) => c.grade.level));
    const sortedLevels = [...levelSet].sort((a, b) => a - b);

    // Find next level for a given level number
    function getNextLevel(currentLevel: number): number | null {
      const idx = sortedLevels.indexOf(currentLevel);
      if (idx === -1 || idx === sortedLevels.length - 1) return null;
      return sortedLevels[idx + 1];
    }

    // Find the max level for graduation detection
    const maxLevel =
      sortedLevels.length > 0 ? sortedLevels[sortedLevels.length - 1] : null;

    const items: PromotionRecommendationItemDto[] = enrollments.map(
      (enrollment) => {
        const sourceLevel = enrollment.classroom.grade.level;
        const isGraduating = maxLevel !== null && sourceLevel >= maxLevel;
        const recommendedAction = isGraduating
          ? PromotionAction.GRADUATE
          : PromotionAction.PROMOTE;

        let targetClassroomId: string | undefined;
        let targetClassroomName: string | undefined;
        let targetLevel: string | undefined;

        if (!isGraduating) {
          const nextLevel = getNextLevel(sourceLevel);
          if (nextLevel !== null) {
            const matchingTargets = targetClassrooms.filter(
              (c) => c.grade.level === nextLevel,
            );
            const codeMatch = matchingTargets.find(
              (c) => c.code === enrollment.classroom.code,
            );
            const bestMatch = codeMatch ?? matchingTargets[0];

            if (bestMatch) {
              targetClassroomId = bestMatch.id;
              targetClassroomName = bestMatch.code ?? undefined;
              targetLevel = bestMatch.grade.name;
            }
          }
        }

        return {
          studentId: enrollment.student.id,
          studentName: enrollment.student.user.profile?.name ?? '-',
          nis: enrollment.student.nis,
          sourceClassroomId: enrollment.classroom.id,
          sourceClassroomName: enrollment.classroom.code,
          sourceLevel: enrollment.classroom.grade.name,
          recommendedAction,
          targetClassroomId,
          targetClassroomName,
          targetLevel,
          averageScore: enrollment.reportCard?.totalAverage ?? null,
        };
      },
    );

    return {
      items,
      totalStudents: items.length,
    };
  }
}
