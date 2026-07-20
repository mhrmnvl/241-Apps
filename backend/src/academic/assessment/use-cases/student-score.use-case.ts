import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { IStudentScoresRepository } from '../domain/interfaces/student-scores-repository.interface.js';
import {
  CreateStudentScoreDto,
  UpdateStudentScoreDto,
  StudentScoreQueryDto,
} from '../dto/request/student-score.dto.js';

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
