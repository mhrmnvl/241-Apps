import { Injectable } from '@nestjs/common';
import { GenerateRecommendationDto } from '../dto/request/generate-recommendation.dto.js';
import {
  PromotionRecommendationDto,
  PromotionRecommendationItemDto,
} from '../dto/response/promotion-recommendation.dto.js';
import { PromotionAction } from '../domain/enums/promotion-action.enum.js';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';
import { isSameSection } from '../logic/classroom-section.js';
import { PromotionSemesterResolver } from '../services/promotion-semester-resolver.service.js';

@Injectable()
export class GeneratePromotionRecommendationUseCase {
  constructor(
    private readonly promotionRepository: IPromotionRepository,
    private readonly semesterResolver: PromotionSemesterResolver,
  ) {}

  async execute(
    dto: GenerateRecommendationDto,
  ): Promise<PromotionRecommendationDto> {
    const { sourceAcademicYearId, targetAcademicYearId } = dto;

    // Only the source term is needed. Which one that is remains the resolver's
    // call, not the caller's — but the target side of a recommendation is a
    // set of classrooms, and those hang off the academic year rather than off
    // a term. Asking for the target term here would refuse to plan a promotion
    // into a year still being set up, which is exactly when you plan one.
    const sourceSemester = await this.semesterResolver.resolveSource(
      sourceAcademicYearId,
      targetAcademicYearId,
    );

    const [enrollments, targetClassrooms] = await Promise.all([
      this.promotionRepository.findActiveEnrollmentsWithDetails(
        sourceSemester.id,
      ),
      this.promotionRepository.findClassesByAcademicYear(targetAcademicYearId),
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

    // Final-year students are not promoted, and are no longer graduated from
    // here either — that is Kelulusan's job now. They are counted so the screen
    // can say how many were left out rather than appearing to have covered
    // everyone.
    const isFinalYear = (level: number) =>
      maxLevel !== null && level >= maxLevel;
    const graduating = enrollments.filter((e) =>
      isFinalYear(e.classroom.grade.level),
    );
    const promotable = enrollments.filter(
      (e) => !isFinalYear(e.classroom.grade.level),
    );

    const items: PromotionRecommendationItemDto[] = promotable.map(
      (enrollment) => {
        const sourceLevel = enrollment.classroom.grade.level;
        const recommendedAction = PromotionAction.PROMOTE;

        let targetClassroomId: string | undefined;
        let targetClassroomName: string | undefined;
        let targetLevel: string | undefined;

        {
          const nextLevel = getNextLevel(sourceLevel);
          if (nextLevel !== null) {
            const matchingTargets = targetClassrooms.filter(
              (c) => c.grade.level === nextLevel,
            );
            // By section, not by code: codes carry the grade too, so `VII-A`
            // never equals `VIII-A` and every VII class used to fall through
            // to the first VIII class on the list. A class stays together.
            const sectionMatch = matchingTargets.find((c) =>
              isSameSection(enrollment.classroom.code, c.code),
            );
            // Only where a school names classes after the grade alone, and the
            // grades therefore match one to one.
            const codeMatch = matchingTargets.find(
              (c) => c.code === enrollment.classroom.code,
            );
            const bestMatch = sectionMatch ?? codeMatch ?? matchingTargets[0];

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
      excludedGraduatingCount: graduating.length,
    };
  }
}
