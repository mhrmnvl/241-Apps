import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { ClassroomRepository } from '../../classroom/index.js';
import {
  BulkImportRowResultDto,
  BulkImportStudentsResponseDto,
} from '../dto/response/bulk-import-student-response.dto.js';
import { BulkImportStudentRowDto } from '../dto/request/bulk-import-student.dto.js';
import { CreateStudentDto } from '../dto/request/create-student.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { ExcelStudentParser } from '../infrastructure/parsers/excel-student.parser.js';
import { StudentCreatedEvent } from '../domain/events/student.events.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class BulkImportStudentsUseCase {
  constructor(
    private readonly repo: StudentRepository,
    private readonly classroomRepo: ClassroomRepository,
    private readonly gradeRepo: IGradeRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly excelParser: ExcelStudentParser,
  ) {}

  async execute(buffer: Buffer): Promise<BulkImportStudentsResponseDto> {
    const rows = await this.excelParser.parse(buffer);
    const results: BulkImportRowResultDto[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      const dto = plainToInstance(BulkImportStudentRowDto, rows[i]);

      const [dupNis, dupNisn] = await Promise.all([
        dto.nis ? this.repo.findByNis(dto.nis) : null,
        dto.nisn ? this.repo.findByNisn(dto.nisn) : null,
      ]);
      const existing = dupNis ?? dupNisn;

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      if (errors.length > 0) {
        const messages = errors
          .map((e) => Object.values(e.constraints ?? {}).join(', '))
          .join('; ');

        const conflictMsg = existing
          ? `; ${dupNis ? `NIS "${dto.nis}" is already registered` : `NISN "${dto.nisn}" is already registered`}`
          : '';

        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          existingId: existing?.id,
          data: dto,
          error: `Validation failed: ${messages}${conflictMsg}`,
        });
        continue;
      }

      try {
        let resolvedGradeId: string | undefined;
        if (dto.grade) {
          const level = await this.gradeRepo.findByLevel(dto.grade);
          if (!level) {
            results.push({
              row: rowNumber,
              status: 'FAILED',
              identifier: dto.identifier,
              data: dto,
              error: `Tingkat ${dto.grade} tidak ditemukan`,
            });
            continue;
          }
          resolvedGradeId = level.id;
        }

        let resolvedClassroomId: string | undefined;
        if (dto.classroomCode) {
          const classroom = await this.classroomRepo.findByCode(
            dto.classroomCode,
          );
          if (!classroom) {
            results.push({
              row: rowNumber,
              status: 'FAILED',
              identifier: dto.identifier,
              data: dto,
              error: `Kelas dengan kode "${dto.classroomCode}" tidak ditemukan`,
            });
            continue;
          }
          resolvedClassroomId = classroom.id;
        }

        if (existing) {
          results.push({
            row: rowNumber,
            status: 'CONFLICT',
            identifier: dto.identifier,
            existingId: existing.id,
            data: dto,
            error: dupNis
              ? `NIS "${dto.nis}" is already registered`
              : `NISN "${dto.nisn}" is already registered`,
          });
          continue;
        }

        const createDto: CreateStudentDto = {
          identifier: dto.identifier,
          password: dto.password,
          name: dto.name,
          nik: dto.nik,
          gender: dto.gender,
          birthPlace: dto.birthPlace,
          birthDate: dto.birthDate,
          email: dto.email,
          phone: dto.phone,
          gradeId: resolvedGradeId,
          nis: dto.nis,
          nisn: dto.nisn,
        };

        results.push({
          row: rowNumber,
          status: 'SUCCESS',
          identifier: dto.identifier,
          data: dto,
        });
      } catch {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          data: dto,
          error: 'Unexpected error during import',
        });
      }
    }

    const success = results.filter((r) => r.status === 'SUCCESS').length;
    const failed = results.filter((r) => r.status === 'FAILED').length;
    const conflict = results.filter((r) => r.status === 'CONFLICT').length;

    return { total: results.length, success, failed, conflict, results };
  }
}
