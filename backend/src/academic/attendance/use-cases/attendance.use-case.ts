import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IAttendanceRepository } from '../domain/interfaces/attendance-repository.interface.js';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceQueryDto,
  BulkUpsertAttendanceDto,
  AttendanceRecapQueryDto,
  AttendanceTrendQueryDto,
} from '../dto/request/attendance.dto.js';

@Injectable()
export class GetAttendancesUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(query: AttendanceQueryDto) {
    return this.attendanceRepository.findAll(query);
  }
}

@Injectable()
export class GetAttendanceByIdUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(id: string) {
    const r = await this.attendanceRepository.findById(id);
    if (!r) throw new NotFoundException(`Attendance ${id} not found`);
    return r;
  }
}

@Injectable()
export class CreateAttendanceUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}
  async execute(dto: CreateAttendanceDto) {
    const enrollment = await this.enrollmentRepository.findById(
      dto.enrollmentId,
    );
    if (enrollment?.status !== 'ACTIVE') {
      throw new BadRequestException('Enrollment not found or is not active');
    }

    const dup = await this.attendanceRepository.findDuplicate(
      dto.enrollmentId,
      new Date(dto.date),
      dto.scheduleId,
    );
    if (dup)
      throw new ConflictException('Attendance already recorded for this date');

    const softDeleted = await this.attendanceRepository.findSoftDeleted(
      dto.enrollmentId,
      new Date(dto.date),
      dto.scheduleId,
    );
    if (softDeleted) {
      return this.attendanceRepository.restore(softDeleted.id, {
        status: dto.status,
        note: dto.note,
      });
    }

    return this.attendanceRepository.create({
      ...dto,
      date: new Date(dto.date),
    });
  }
}

@Injectable()
export class UpdateAttendanceUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(id: string, dto: UpdateAttendanceDto) {
    const r = await this.attendanceRepository.findById(id);
    if (!r) throw new NotFoundException(`Attendance ${id} not found`);
    return this.attendanceRepository.update(id, dto);
  }
}

@Injectable()
export class DeleteAttendanceUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(id: string) {
    const r = await this.attendanceRepository.findById(id);
    if (!r) throw new NotFoundException(`Attendance ${id} not found`);
    return this.attendanceRepository.softDelete(id);
  }
}

@Injectable()
export class BulkUpsertAttendanceUseCase {
  constructor(
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}
  async execute(dto: BulkUpsertAttendanceDto) {
    const enrollmentIds = dto.records.map((r) => r.enrollmentId);
    if (enrollmentIds.length > 0) {
      const count =
        await this.enrollmentRepository.countActiveByIds(enrollmentIds);
      if (count !== enrollmentIds.length) {
        throw new BadRequestException(
          'Some enrollments were not found or are not active',
        );
      }
    }
    return this.attendanceRepository.bulkUpsert(
      new Date(dto.date),
      dto.records,
      dto.scheduleId,
    );
  }
}

@Injectable()
export class GetAttendanceRecapUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(query: AttendanceRecapQueryDto) {
    return this.attendanceRepository.getRecap(query);
  }
}

@Injectable()
export class GetAttendanceTrendUseCase {
  constructor(private readonly attendanceRepository: IAttendanceRepository) {}
  async execute(query: AttendanceTrendQueryDto) {
    return this.attendanceRepository.getMonthlyTrend(query);
  }
}
