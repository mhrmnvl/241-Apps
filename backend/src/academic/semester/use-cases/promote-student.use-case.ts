import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PromotionAction } from '../domain/enums/promotion-action.enum.js';
import { PromotionDto } from '../dto/request/promotion.dto.js';
import { PromotionResultDto } from '../dto/response/promotion-result.dto.js';
import { IPromotionRepository } from '../domain/interfaces/promotion-repository.interface.js';

@Injectable()
export class PromoteStudentsUseCase {
  private readonly logger = new Logger(PromoteStudentsUseCase.name);

  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async execute(dto: PromotionDto): Promise<PromotionResultDto> {
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

    for (const student of students) {
      const sourceClassroom = await this.promotionRepository.findClassroomById(
        student.sourceClassroomId,
      );
      if (!sourceClassroom) {
        throw new NotFoundException(
          `Source classroom with ID ${student.sourceClassroomId} not found`,
        );
      }
      if (sourceClassroom.academicYearId !== sourceSemester.academicYearId) {
        throw new BadRequestException(
          `Source classroom "${sourceClassroom.code}" does not belong to source academic year`,
        );
      }

      // Every remaining action moves the student somewhere, so a target is
      // always required — it used to be optional because GRADUATE had none.
      if (!student.targetClassroomId) {
        throw new BadRequestException(
          'PROMOTE/REPEAT action requires a targetClassroomId',
        );
      }

      if (student.action === PromotionAction.REPEAT && !student.declineReason) {
        throw new BadRequestException('REPEAT action requires a declineReason');
      }

      const targetClassroom = await this.promotionRepository.findClassroomById(
        student.targetClassroomId,
      );
      if (!targetClassroom) {
        throw new NotFoundException(
          `Target classroom with ID ${student.targetClassroomId} not found`,
        );
      }
      if (targetClassroom.academicYearId !== targetSemester.academicYearId) {
        throw new BadRequestException(
          `Target classroom "${targetClassroom.code}" does not belong to target academic year`,
        );
      }

      const sourceLevel = sourceClassroom.grade.level;
      const targetLevel = targetClassroom.grade.level;

      if (student.action === PromotionAction.PROMOTE) {
        if (targetLevel <= sourceLevel) {
          throw new BadRequestException(
            `PROMOTE expects target level higher than ${sourceLevel}, but got ${targetLevel}`,
          );
        }
      }

      if (student.action === PromotionAction.REPEAT) {
        if (targetLevel !== sourceLevel) {
          throw new BadRequestException(
            `REPEAT expects target level ${sourceLevel}, but got ${targetLevel}`,
          );
        }
      }
    }

    const result = await this.promotionRepository.executePromotion(
      sourceSemesterId,
      targetSemesterId,
      students,
    );

    this.logger.log(
      `Promotion completed: ${result.promoted} promoted, ` +
        `${result.repeated} repeated, ${result.skipped} skipped`,
    );

    return result;
  }
}
