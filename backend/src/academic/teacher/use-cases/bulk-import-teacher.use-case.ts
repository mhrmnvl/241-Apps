import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  BulkImportTeacherRowResultDto,
  BulkImportTeachersResponseDto,
} from '../dto/response/bulk-import-teacher-response.dto.js';
import { BulkImportTeacherRowDto } from '../dto/request/bulk-import-teacher.dto.js';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';
import { ExcelTeacherParser } from '../domain/interfaces/teacher-excel-parser.interface.js';
import { resolveOnceByKey } from '../../../shared/utils/resolve-once-by-key.helper.js';

/**
 * Inspects an import file and reports what each row would do. It writes
 * nothing — see the note on `BulkImportStudentsUseCase`, which this mirrors.
 *
 * `SUCCESS` means "would be created", not "was created"; the write happens in
 * `bulk-import/resolve` once the caller has seen the preview and confirmed.
 */
@Injectable()
export class BulkImportTeachersUseCase {
  constructor(
    private readonly teacherRepository: ITeacherRepository,
    private readonly parser: ExcelTeacherParser,
  ) {}

  async execute(buffer: Buffer): Promise<BulkImportTeachersResponseDto> {
    const rawDtos = await this.parser.parse(buffer);

    const dtos = rawDtos.map((row) =>
      plainToInstance(BulkImportTeacherRowDto, row),
    );

    const employmentTypeIdByCode = await resolveOnceByKey(
      dtos.map((d) => d.employmentTypeCode),
      (code) => this.teacherRepository.resolveEmploymentTypeId(code),
    );

    const results: BulkImportTeacherRowResultDto[] = [];

    // Nothing is written while the sheet is walked, so two rows of the same
    // file claiming one identity both look new to the lookups below. Remember
    // what earlier rows claimed, or the duplicate passes the preview and only
    // fails at apply time.
    const seen = new Map<string, number>();

    for (let i = 0; i < dtos.length; i++) {
      const rowNumber = i + 2; // row 1 = header
      const dto = dtos[i];

      const identities = [
        ['NIP', 'nip', dto.nip],
        ['NUPTK', 'nuptk', dto.nuptk],
        ['NIK', 'nik', dto.nik],
        ['Username', 'identifier', dto.identifier],
      ] as const;

      let duplicate: { label: string; value: string; firstRow: number } | null =
        null;
      let duplicateUsername: { value: string; firstRow: number } | null = null;
      for (const [label, field, value] of identities) {
        if (!value) continue;
        const key = `${field}:${value}`;
        const firstRow = seen.get(key);
        if (firstRow === undefined) {
          seen.set(key, rowNumber);
          continue;
        }
        // A repeated username is fatal rather than a choice: applying an
        // update never reassigns an identifier, so the second row could not
        // be written under any answer the user gives. The other three are
        // re-resolvable at apply time, so they become a conflict.
        if (field === 'identifier') {
          duplicateUsername ??= { value, firstRow };
        } else {
          duplicate ??= { label, value, firstRow };
        }
      }

      if (duplicateUsername) {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          data: dto,
          error: `Username "${duplicateUsername.value}" is duplicated in this file (row ${duplicateUsername.firstRow})`,
        });
        continue;
      }

      const [dupUsername, dupNik, dupNip, dupNuptk] = await Promise.all([
        dto.identifier
          ? this.teacherRepository.findUserByIdentifier(dto.identifier)
          : null,
        dto.nik ? this.teacherRepository.findProfileByNik(dto.nik) : null,
        dto.nip ? this.teacherRepository.findByNip(dto.nip) : null,
        dto.nuptk ? this.teacherRepository.findByNuptk(dto.nuptk) : null,
      ]);

      const existingId = dupNip
        ? dupNip.id
        : dupNuptk
          ? dupNuptk.id
          : dupNik
            ? (await this.teacherRepository.findByUserId(dupNik.userId))?.id
            : undefined;

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      if (errors.length > 0) {
        const messages = errors
          .map((e) => Object.values(e.constraints ?? {}).join(', '))
          .join('; ');

        let conflictMsg = '';
        if (dupUsername) {
          conflictMsg = `; Username "${dto.identifier}" is already taken`;
        } else if (dupNik || dupNip || dupNuptk) {
          conflictMsg = `; ${
            dupNip
              ? `NIP "${dto.nip}" is already registered`
              : dupNuptk
                ? `NUPTK "${dto.nuptk}" is already registered`
                : `NIK "${dto.nik}" is already registered`
          }`;
        }

        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          existingId,
          data: dto,
          error: `Validation failed: ${messages}${conflictMsg}`,
        });
        continue;
      }

      if ((dupNik || dupNip || dupNuptk) && existingId) {
        results.push({
          row: rowNumber,
          status: 'CONFLICT',
          identifier: dto.identifier,
          existingId,
          data: dto,
          error: dupNip
            ? `NIP "${dto.nip}" is already registered`
            : dupNuptk
              ? `NUPTK "${dto.nuptk}" is already registered`
              : `NIK "${dto.nik}" is already registered`,
        });
        continue;
      }

      if (dupUsername) {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          existingId,
          data: dto,
          error: `Identifier "${dto.identifier}" is already taken`,
        });
        continue;
      }

      // Looked up to prove the employment type exists; the apply step resolves
      // it again from the row data it is handed.
      if (!employmentTypeIdByCode.get(dto.employmentTypeCode)) {
        results.push({
          row: rowNumber,
          status: 'FAILED',
          identifier: dto.identifier,
          data: dto,
          error: `Employment type with code "${dto.employmentTypeCode}" not found`,
        });
        continue;
      }

      // Duplicating an earlier row of the same file is a conflict too, and it
      // carries no `existingId` because the row it collides with is created by
      // this same apply run, moments before this one is processed. The apply
      // step resolves the id then, which is what lets the same update/skip
      // choice be offered here as for a teacher already in the database.
      if (duplicate) {
        results.push({
          row: rowNumber,
          status: 'CONFLICT',
          identifier: dto.identifier,
          data: dto,
          error: `${duplicate.label} "${duplicate.value}" is duplicated in this file (row ${duplicate.firstRow})`,
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
