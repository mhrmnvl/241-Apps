import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { IClassroomRepository } from '../../classroom/index.js';
import {
  BulkImportRowResultDto,
  BulkImportStudentsResponseDto,
} from '../dto/response/bulk-import-student-response.dto.js';
import { BulkImportStudentRowDto } from '../dto/request/bulk-import-student.dto.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { ExcelStudentParser } from '../domain/interfaces/student-excel-parser.interface.js';
import { resolveOnceByKey } from '../../../shared/utils/resolve-once-by-key.helper.js';

/**
 * Inspects an import file and reports what each row would do. It writes
 * nothing.
 *
 * This is the half the preview dialog reads, and the preview is only worth
 * having if it runs before the decision: the caller sees the verdict per row,
 * chooses per conflict, and only then posts to `bulk-import/resolve`, which is
 * the half that writes. This use case used to create every valid row as it
 * walked the sheet, which made the dialog a report of work already done.
 *
 * `SUCCESS` therefore means "would be created", not "was created".
 */
@Injectable()
export class BulkImportStudentsUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly classroomRepository: IClassroomRepository,
    private readonly gradeRepository: IGradeRepository,
    private readonly excelParser: ExcelStudentParser,
  ) {}

  async execute(buffer: Buffer): Promise<BulkImportStudentsResponseDto> {
    const rows = await this.excelParser.parse(buffer);
    const dtos = rows.map((row) =>
      plainToInstance(BulkImportStudentRowDto, row),
    );

    const [gradeByLevel, classroomByCode] = await Promise.all([
      resolveOnceByKey(
        dtos.map((d) => d.grade),
        (level) => this.gradeRepository.findByLevel(level),
      ),
      resolveOnceByKey(
        dtos.map((d) => d.classroomCode),
        (code) => this.classroomRepository.findByCode(code),
      ),
    ]);

    const results: BulkImportRowResultDto[] = [];

    // Nothing is written while the sheet is walked, so a row duplicating an
    // earlier row of the same file cannot be caught by the database lookups
    // below — both rows look new. Left undetected, the duplicate survives the
    // preview as SUCCESS and only fails once the apply step tries to create it
    // twice. Remember what earlier rows claimed instead.
    const seen = new Map<string, number>();

    for (let i = 0; i < dtos.length; i++) {
      const rowNumber = i + 2;
      const dto = dtos[i];

      // Both identities are checked, not whichever one the row happens to
      // carry: two rows can agree on NISN while their NIS differ, and that
      // pair collides just as hard.
      let duplicate: { label: string; value: string; firstRow: number } | null =
        null;
      for (const [label, value] of [
        ['NIS', dto.nis],
        ['NISN', dto.nisn],
      ] as const) {
        if (!value) continue;
        const key = `${label}:${value}`;
        const firstRow = seen.get(key);
        if (firstRow !== undefined) {
          duplicate ??= { label, value, firstRow };
        } else {
          seen.set(key, rowNumber);
        }
      }

      if (duplicate) {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          data: dto,
          error: `${duplicate.label} "${duplicate.value}" is duplicated in this file (row ${duplicate.firstRow})`,
        });
        continue;
      }

      const [dupNis, dupNisn] = await Promise.all([
        dto.nis ? this.studentRepository.findByNis(dto.nis) : null,
        dto.nisn ? this.studentRepository.findByNisn(dto.nisn) : null,
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

      // The grade and classroom are looked up to prove they exist, not to be
      // carried anywhere: the apply step resolves them again from the row data
      // it is handed.
      if (dto.grade && !gradeByLevel.get(dto.grade)) {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          data: dto,
          error: `Tingkat ${dto.grade} not found`,
        });
        continue;
      }

      if (dto.classroomCode && !classroomByCode.get(dto.classroomCode)) {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          data: dto,
          error: `Classroom with code "${dto.classroomCode}" not found`,
        });
        continue;
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

      results.push({
        row: rowNumber,
        status: 'SUCCESS',
        identifier: dto.identifier,
        data: dto,
      });
    }

    const success = results.filter((r) => r.status === 'SUCCESS').length;
    const failed = results.filter((r) => r.status === 'FAILED').length;
    const conflict = results.filter((r) => r.status === 'CONFLICT').length;

    return { total: results.length, success, failed, conflict, results };
  }
}
