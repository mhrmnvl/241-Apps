import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { IStudentScoresRepository } from '../domain/interfaces/student-scores-repository.interface.js';
import { CreateStudentScoreDto } from '../dto/request/create-student-score.dto.js';
import { UpdateStudentScoreDto } from '../dto/request/update-student-score.dto.js';
import { StudentScoreQueryDto } from '../dto/request/student-score-query.dto.js';
import { BulkUpsertStudentScoreDto } from '../dto/request/bulk-upsert-student-score.dto.js';
import { StudentScoreRosterQueryDto } from '../dto/request/student-score-roster-query.dto.js';

@Injectable()
export class GetStudentScoresUseCase {
  constructor(private readonly repo: IStudentScoresRepository) {}
  async execute(query: StudentScoreQueryDto) {
    return this.repo.findAll(query);
  }
}

@Injectable()
export class GetStudentScoreByIdUseCase {
  constructor(private readonly repo: IStudentScoresRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return r;
  }
}

@Injectable()
export class CreateStudentScoreUseCase {
  constructor(
    private readonly repo: IStudentScoresRepository,
    private readonly prisma: PrismaService,
  ) {}
  async execute(dto: CreateStudentScoreDto) {
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: {
        id: dto.enrollmentId,
      },
    });
    if (!enrollment) {
      throw new BadRequestException('Enrollment not found');
    }

    const assessmentItem = await this.prisma.assessmentItem.findFirst({
      where: {
        id: dto.assessmentItemId,
        teachingAssignment: {
          classroom: { academicYear: { deletedAt: null } },
        },
      },
    });
    if (!assessmentItem) {
      throw new BadRequestException('Assessment item not found');
    }

    const dup = await this.repo.findDuplicate(
      dto.enrollmentId,
      dto.assessmentItemId,
    );
    if (dup)
      throw new ConflictException(
        'Score already exists for this enrollment and assessment',
      );

    const softDeleted = await this.repo.findSoftDeleted(
      dto.enrollmentId,
      dto.assessmentItemId,
    );
    if (softDeleted) {
      return this.repo.restore(softDeleted.id, {
        score: dto.score,
        note: dto.note,
      });
    }

    return this.repo.create(dto);
  }
}

@Injectable()
export class UpdateStudentScoreUseCase {
  constructor(private readonly repo: IStudentScoresRepository) {}
  async execute(id: string, dto: UpdateStudentScoreDto) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return this.repo.update(id, dto);
  }
}

@Injectable()
export class DeleteStudentScoreUseCase {
  constructor(private readonly repo: IStudentScoresRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`StudentScore ${id} not found`);
    return this.repo.softDelete(id);
  }
}

@Injectable()
export class GetStudentScoreRosterUseCase {
  constructor(
    private readonly repo: IStudentScoresRepository,
    private readonly prisma: PrismaService,
  ) {}
  async execute(query: StudentScoreRosterQueryDto) {
    const assessmentItem = await this.prisma.assessmentItem.findFirst({
      where: {
        id: query.assessmentItemId,
        teachingAssignment: {
          classroom: { academicYear: { deletedAt: null } },
        },
      },
      include: { teachingAssignment: true },
    });
    if (!assessmentItem) {
      throw new NotFoundException(
        `AssessmentItem ${query.assessmentItemId} not found`,
      );
    }

    const items = await this.repo.getRoster(
      assessmentItem.id,
      assessmentItem.teachingAssignment.classroomId,
      assessmentItem.teachingAssignment.semesterId,
    );

    return {
      assessmentItem: {
        id: assessmentItem.id,
        name: assessmentItem.name,
        type: assessmentItem.type,
        weight: assessmentItem.weight,
        maxScore: assessmentItem.maxScore,
      },
      items,
    };
  }
}

@Injectable()
export class BulkUpsertStudentScoresUseCase {
  constructor(
    private readonly repo: IStudentScoresRepository,
    private readonly prisma: PrismaService,
  ) {}
  async execute(dto: BulkUpsertStudentScoreDto) {
    const assessmentItem = await this.prisma.assessmentItem.findFirst({
      where: {
        id: dto.assessmentItemId,
        teachingAssignment: {
          classroom: { academicYear: { deletedAt: null } },
        },
      },
    });
    if (!assessmentItem) {
      throw new BadRequestException('Assessment item not found');
    }

    const enrollmentIds = dto.records.map((r) => r.enrollmentId);
    const count = await this.prisma.studentEnrollment.count({
      where: { id: { in: enrollmentIds } },
    });
    if (count !== enrollmentIds.length) {
      throw new BadRequestException('Some enrollments were not found');
    }

    return this.repo.bulkUpsert(dto.assessmentItemId, dto.records);
  }
}
