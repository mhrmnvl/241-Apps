import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  BulkImportTeacherRowResultDto,
  BulkImportTeachersResponseDto,
} from '../dto/response/bulk-import-teacher-response.dto.js';
import { BulkImportTeacherRowDto } from '../dto/request/bulk-import-teacher.dto.js';
import { CreateTeacherDto } from '../dto/request/create-teacher.dto.js';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';
import { CreateTeacherUseCase } from './create-teacher.use-case.js';
import { ExcelTeacherParser } from '../domain/interfaces/teacher-excel-parser.interface.js';
import { resolveOnceByKey } from '../../../shared/utils/resolve-once-by-key.helper.js';

@Injectable()
export class BulkImportTeachersUseCase {
  constructor(
    private readonly teacherRepository: ITeacherRepository,
    private readonly createTeacher: CreateTeacherUseCase,
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

    for (let i = 0; i < dtos.length; i++) {
      const rowNumber = i + 2; // row 1 = header
      const dto = dtos[i];

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

      try {
        if (dupNik || dupNip || dupNuptk) {
          if (existingId) {
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

        const employmentTypeId = employmentTypeIdByCode.get(
          dto.employmentTypeCode,
        )!;
        const createDto: CreateTeacherDto = {
          ...dto,
          employmentTypeId,
        };

        await this.createTeacher.execute(createDto);

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
