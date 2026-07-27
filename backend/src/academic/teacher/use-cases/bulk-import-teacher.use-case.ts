import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import ExcelJS from 'exceljs';
import {
  BulkImportTeacherRowResultDto,
  BulkImportTeachersResponseDto,
} from '../dto/response/bulk-import-teacher-response.dto.js';
import { BulkImportTeacherRowDto } from '../dto/request/bulk-import-teacher.dto.js';
import { CreateTeacherDto } from '../dto/request/create-teacher.dto.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { CreateTeacherUseCase } from './create-teacher.use-case.js';

type ExcelRow = Record<string, ExcelJS.CellValue>;
type MappedRow = Record<string, string | undefined>;

@Injectable()
export class BulkImportTeachersUseCase {
  constructor(
    private readonly repo: TeacherRepository,
    private readonly createTeacher: CreateTeacherUseCase,
  ) {}

  async execute(buffer: Buffer): Promise<BulkImportTeachersResponseDto> {
    const rows = await this.parseExcel(buffer);

    if (rows.length === 0) {
      throw new BadRequestException(
        'Excel file is empty or has no valid data rows',
      );
    }

    const results: BulkImportTeacherRowResultDto[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // row 1 = header
      const rawRow: MappedRow = this.mapColumns(rows[i]);

      const dto = plainToInstance(BulkImportTeacherRowDto, rawRow);
      const [dupUsername, dupNik, dupNip, dupNuptk] = await Promise.all([
        dto.identifier ? this.repo.findUserByIdentifier(dto.identifier) : null,
        dto.nik ? this.repo.findProfileByNik(dto.nik) : null,
        dto.nip ? this.repo.findByNip(dto.nip) : null,
        dto.nuptk ? this.repo.findByNuptk(dto.nuptk) : null,
      ]);

      const existingId = dupNip
        ? dupNip.id
        : dupNuptk
          ? dupNuptk.id
          : dupNik
            ? (await this.repo.findByUserId(dupNik.userId))?.id
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
          identifier: rawRow.identifier,
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

        const employmentTypeId = await this.repo.resolveEmploymentTypeId(
          dto.employmentTypeCode,
        );
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
  private mapColumns(row: ExcelRow): MappedRow {
    const pick = (...keys: string[]): ExcelJS.CellValue =>
      keys.reduce<ExcelJS.CellValue>((val, k) => val ?? row[k], undefined);
    const str = (...keys: string[]): string => {
      const v = pick(...keys);
      if (typeof v === 'string') return v.trim();
      if (typeof v === 'number') return String(v).trim();
      return '';
    };

    const rawGender = str('Jenis Kelamin', 'gender').toUpperCase();
    const gender =
      rawGender === 'L'
        ? 'MALE'
        : rawGender === 'P'
          ? 'FEMALE'
          : rawGender || undefined;

    const nip = str('NIP', 'nip') || undefined;
    const nuptk = str('NUPTK', 'nuptk') || undefined;
    const nik = str('NIK', 'nik');
    const fallback = nip ?? nuptk ?? nik;
    const identifier =
      str('Identifier', 'identifier') ||
      str('Username', 'username') ||
      fallback;
    const password = str('Password', 'password') || fallback;

    return {
      identifier,
      password,
      name: str('Nama', 'name'),
      nik,
      gender,
      birthPlace: str('Tempat Lahir', 'birthPlace'),
      birthDate: str('Tanggal Lahir', 'birthDate'),
      email: str('Email', 'email') || undefined,
      phone: str('Telepon', 'phone') || undefined,
      nip,
      nuptk,
      employmentTypeCode:
        str('Status Kepegawaian', 'employmentTypeCode') ||
        str('Status Kepegawaian', 'employmentStatus') ||
        'NON_ASN',
    };
  }

  private async parseExcel(buffer: Buffer): Promise<ExcelRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(new Uint8Array(buffer).buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount < 2) {
      return [];
    }

    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.text;
    });

    const rows: ExcelRow[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const record: ExcelRow = {};
      let hasValue = false;
      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber];
        if (key) {
          record[key] = cell.value;
          hasValue = true;
        }
      });
      if (hasValue) {
        rows.push(record);
      }
    });

    return rows;
  }
}
