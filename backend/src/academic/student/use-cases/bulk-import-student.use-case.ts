import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
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
import { CreateStudentUseCase } from './create-student.use-case.js';

@Injectable()
export class BulkImportStudentsUseCase {
  constructor(
    private readonly repo: StudentRepository,
    private readonly classroomRepo: ClassroomRepository,
    private readonly gradeRepo: IGradeRepository,
    private readonly excelParser: ExcelStudentParser,
    private readonly createStudent: CreateStudentUseCase,
  ) {}

  async execute(buffer: Buffer): Promise<BulkImportStudentsResponseDto> {
    const rows = await this.excelParser.parse(buffer);
    const dtos = rows.map((row) =>
      plainToInstance(BulkImportStudentRowDto, row),
    );

    const uniqueGrades = [
      ...new Set(dtos.map((d) => d.grade).filter((g): g is number => !!g)),
    ];
    const uniqueClassroomCodes = [
      ...new Set(
        dtos.map((d) => d.classroomCode).filter((c): c is string => !!c),
      ),
    ];
    const [gradeEntries, classroomEntries] = await Promise.all([
      Promise.all(
        uniqueGrades.map(
          async (level) =>
            [level, await this.gradeRepo.findByLevel(level)] as const,
        ),
      ),
      Promise.all(
        uniqueClassroomCodes.map(
          async (code) =>
            [code, await this.classroomRepo.findByCode(code)] as const,
        ),
      ),
    ]);
    const gradeByLevel = new Map(gradeEntries);
    const classroomByCode = new Map(classroomEntries);

    const results: BulkImportRowResultDto[] = [];

    for (let i = 0; i < dtos.length; i++) {
      const rowNumber = i + 2;
      const dto = dtos[i];

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
          const level = gradeByLevel.get(dto.grade);
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
          const classroom = classroomByCode.get(dto.classroomCode);
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
          classroomId: resolvedClassroomId,
          nis: dto.nis,
          nisn: dto.nisn,
        };

        await this.createStudent.execute(createDto);

        results.push({
          row: rowNumber,
          status: 'SUCCESS',
          identifier: dto.identifier,
          data: dto,
        });
      } catch (err) {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          data: dto,
          error:
            err instanceof Error
              ? err.message
              : 'Unexpected error during import',
        });
      }
    }

    const success = results.filter((r) => r.status === 'SUCCESS').length;
    const failed = results.filter((r) => r.status === 'FAILED').length;
    const conflict = results.filter((r) => r.status === 'CONFLICT').length;

    return { total: results.length, success, failed, conflict, results };
  }
}
