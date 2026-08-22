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
 *
 * Each step asks for the least it needs. Only the write requires the target
 * term to exist, because only the write puts a row in it.
 */
@Injectable()
export class PromotionSemesterResolver {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  /**
   * The only precondition every step of a promotion shares.
   *
   * Cheap on purpose, and asked on its own by the steps that need nothing
   * else: counting up a set of decisions does not require either term to
   * exist.
   */
  assertDifferentYears(
    sourceAcademicYearId: string,
    targetAcademicYearId: string,
  ): void {
    if (sourceAcademicYearId === targetAcademicYearId) {
      throw new BadRequestException(
        'Promotion moves students between academic years. To move between the ' +
          'terms of one year, use rollover.',
      );
    }
  }

  /**
   * The term a promotion reads from.
   *
   * Required wherever enrolments are actually read: there is no roster to
   * recommend from if the year being left never had a term. The target year is
   * taken but only checked against this one — building a recommendation needs
   * the target's *classrooms*, which hang off the year, not off a term.
   */
  async resolveSource(
    sourceAcademicYearId: string,
    targetAcademicYearId: string,
  ): Promise<SemesterWithAcademicYear> {
    this.assertDifferentYears(sourceAcademicYearId, targetAcademicYearId);

    const source =
      await this.promotionRepository.findEdgeSemesterOfAcademicYear(
        sourceAcademicYearId,
        'last',
      );

    // Named rather than numbered. A year with no terms is something the
    // operator can fix, and "2026/2027 has no semester" says what to do while
    // a uuid does not.
    if (!source) {
      throw new BadRequestException(
        `Academic year ${await this.nameOf(sourceAcademicYearId)} has no ` +
          'semester to promote students from.',
      );
    }

    return source;
  }

  /**
   * Both terms — demanded only by the step that writes.
   *
   * An enrolment row carries a `semesterId`, so the target term has to exist
   * before anyone can be enrolled into it. That is a precondition of executing
   * a promotion and of nothing before it: planning one for a year still being
   * set up is ordinary, and used to be refused because this asked for both
   * terms on every call.
   */
  async resolveBoth(
    sourceAcademicYearId: string,
    targetAcademicYearId: string,
  ): Promise<ResolvedPromotionSemesters> {
    const source = await this.resolveSource(
      sourceAcademicYearId,
      targetAcademicYearId,
    );

    const target =
      await this.promotionRepository.findEdgeSemesterOfAcademicYear(
        targetAcademicYearId,
        'first',
      );

    if (!target) {
      throw new BadRequestException(
        `Academic year ${await this.nameOf(targetAcademicYearId)} has no ` +
          'semester to enrol students into. Create its first term before ' +
          'running the promotion.',
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
