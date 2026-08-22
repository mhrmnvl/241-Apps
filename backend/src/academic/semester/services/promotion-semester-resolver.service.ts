import { BadRequestException, Injectable } from '@nestjs/common';
import { SemesterWithAcademicYear } from '../domain/entities/semester.entity.js';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';

export interface ResolvedPromotionSemesters {
  source: SemesterWithAcademicYear;
  target: SemesterWithAcademicYear;
}

/**
 * Which terms a promotion between two academic years actually touches.
 *
 * Enrolment is keyed on a semester, not on a year — `@@unique([studentId,
 * semesterId])` — so the operation has to read from one term and write into
 * another even though what it means is "move up a year". That choice is made
 * here rather than asked of the caller: the last term of the year being left,
 * the first term of the year being entered.
 *
 * Ordered by `SemesterType.sequence`. Never by name: semester types are master
 * data the school edits, and the sequence column exists precisely because
 * ordering on the name sorted the English enum alphabetically — EVEN before
 * ODD — and a rename or a third term would scramble it again.
 *
 * Shared by the recommendation and the execution so the two cannot disagree
 * about which terms a run covers. A preview of one pair followed by an
 * execution of another is the kind of defect nobody notices until a cohort is
 * in the wrong classroom.
 */
@Injectable()
export class PromotionSemesterResolver {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async resolve(
    sourceAcademicYearId: string,
    targetAcademicYearId: string,
  ): Promise<ResolvedPromotionSemesters> {
    if (sourceAcademicYearId === targetAcademicYearId) {
      throw new BadRequestException(
        'Promotion moves students between academic years. To move between the ' +
          'terms of one year, use rollover.',
      );
    }

    const [source, target] = await Promise.all([
      this.promotionRepository.findEdgeSemesterOfAcademicYear(
        sourceAcademicYearId,
        'last',
      ),
      this.promotionRepository.findEdgeSemesterOfAcademicYear(
        targetAcademicYearId,
        'first',
      ),
    ]);

    // Named rather than numbered. A year with no terms is something the
    // operator can fix, and "2026/2027 has no semester" says what to do while
    // a uuid does not.
    if (!source) {
      throw new BadRequestException(
        `Academic year ${await this.nameOf(sourceAcademicYearId)} has no ` +
          'semester to promote students from.',
      );
    }
    if (!target) {
      throw new BadRequestException(
        `Academic year ${await this.nameOf(targetAcademicYearId)} has no ` +
          'semester to promote students into. Create its first term before ' +
          'running a promotion.',
      );
    }

    return { source, target };
  }

  private async nameOf(academicYearId: string): Promise<string> {
    const name =
      await this.promotionRepository.findAcademicYearName(academicYearId);
    return name ?? academicYearId;
  }
}
