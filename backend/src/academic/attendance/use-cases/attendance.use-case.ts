import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceQueryDto,
  BulkUpsertAttendanceDto,
  AttendanceRecapQueryDto,
} from '../dto/attendance.dto.js';

@Injectable()
export class GetAttendancesUseCase {
  constructor(private readonly repo: IAttendanceRepository) {}
  async execute(query: AttendanceQueryDto) {
    return this.repo.findAll(query);
  }
}

@Injectable()
export class GetAttendanceByIdUseCase {
  constructor(private readonly repo: IAttendanceRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`Attendance ${id} not found`);
    return r;
  }
}

@Injectable()
export class CreateAttendanceUseCase {
  constructor(
    private readonly repo: IAttendanceRepository,
    private readonly prisma: PrismaService,
  ) {}
  async execute(dto: CreateAttendanceDto) {
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: {
        id: dto.enrollmentId,
      },
    });
    if (!enrollment) {
      throw new BadRequestException('Enrollment not found');
    }

    const dup = await this.repo.findDuplicate(
      dto.enrollmentId,
      new Date(dto.date),
      dto.scheduleId,
    );
    if (dup)
      throw new ConflictException('Attendance already recorded for this date');

    const softDeleted = await this.repo.findSoftDeleted(
      dto.enrollmentId,
      new Date(dto.date),
      dto.scheduleId,
    );
    if (softDeleted) {
      return this.repo.restore(softDeleted.id, {
        status: dto.status,
        note: dto.note,
      });
    }

    return this.repo.create({ ...dto, date: new Date(dto.date) });
  }
}

@Injectable()
export class UpdateAttendanceUseCase {
  constructor(private readonly repo: IAttendanceRepository) {}
  async execute(id: string, dto: UpdateAttendanceDto) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`Attendance ${id} not found`);
    return this.repo.update(id, dto);
  }
}

@Injectable()
export class DeleteAttendanceUseCase {
  constructor(private readonly repo: IAttendanceRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`Attendance ${id} not found`);
    return this.repo.softDelete(id);
  }
}

@Injectable()
export class BulkUpsertAttendanceUseCase {
  constructor(
    private readonly repo: IAttendanceRepository,
    private readonly prisma: PrismaService,
  ) {}
  async execute(dto: BulkUpsertAttendanceDto) {
    const enrollmentIds = dto.records.map((r) => r.enrollmentId);
    if (enrollmentIds.length > 0) {
      const count = await this.prisma.studentEnrollment.count({
        where: {
          id: { in: enrollmentIds },
        },
      });
      if (count !== enrollmentIds.length) {
        throw new BadRequestException(
          'Some enrollments do not belong to this school unit',
        );
      }
    }
    return this.repo.bulkUpsert(
      new Date(dto.date),
      dto.records,
      dto.scheduleId,
    );
  }
}

@Injectable()
export class GetAttendanceRecapUseCase {
  constructor(private readonly repo: IAttendanceRepository) {}
  async execute(query: AttendanceRecapQueryDto) {
    return this.repo.getRecap(query);
  }
}
