import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { ClassroomRepository } from '../../classroom/index.js';
import {
  BulkImportRowResultDto,
  BulkImportStudentsResponseDto,
} from '../dto/bulk-import-student-response.dto.js';
import { BulkImportStudentRowDto } from '../dto/bulk-import-student.dto.js';
import { CreateStudentDto } from '../dto/create-student.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { ExcelStudentParser } from '../infrastructure/parsers/excel-student.parser.js';
import { StudentCreatedEvent } from '../domain/events/student.events.js';

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

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      if (errors.length > 0) {
        const messages = errors
          .map((e) => Object.values(e.constraints ?? {}).join(', '))
          .join('; ');

        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          error: `Validation failed: ${messages}`,
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
              error: `Kelas dengan kode "${dto.classroomCode}" tidak ditemukan`,
            });
            continue;
          }
          resolvedClassroomId = classroom.id;
        }

        const [dupNis, dupNisn] = await Promise.all([
          this.repo.findByNis(dto.nis),
          this.repo.findByNisn(dto.nisn),
        ]);

        if (dupNis) {
          results.push({
            row: rowNumber,
            status: 'FAILED',
            identifier: dto.identifier,
            error: `NIS "${dto.nis}" is already registered`,
          });
          continue;
        }

        if (dupNisn) {
          results.push({
            row: rowNumber,
            status: 'FAILED',
            identifier: dto.identifier,
            error: `NISN "${dto.nisn}" is already registered`,
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

        const passwordHash = await bcrypt.hash(createDto.password!, 10);
        const userWithStudent = await this.repo.create(createDto, passwordHash);
        const student = userWithStudent.student;
        if (!student) {
          throw new Error('Student creation failed');
        }

        if (resolvedClassroomId) {
          this.eventEmitter.emit(
            'student.created',
            new StudentCreatedEvent(student.id, resolvedClassroomId),
          );
        }

        results.push({
          row: rowNumber,
          status: 'SUCCESS',
          identifier: dto.identifier,
        });
      } catch {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          error: 'Unexpected error during import',
        });
      }
    }

    const success = results.filter((r) => r.status === 'SUCCESS').length;
    const failed = results.filter((r) => r.status === 'FAILED').length;

    return { total: results.length, success, failed, results };
  }
}
