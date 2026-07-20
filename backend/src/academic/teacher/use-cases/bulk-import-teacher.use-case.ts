import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import ExcelJS from 'exceljs';
import {
  BulkImportTeacherRowResultDto,
  BulkImportTeachersResponseDto,
} from '../dto/response/bulk-import-teacher.response.dto.js';
import { BulkImportTeacherRowDto } from '../dto/bulk-import-teacher.dto.js';
import { CreateTeacherDto } from '../dto/request/create-teacher.request.dto.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

type ExcelRow = Record<string, ExcelJS.CellValue>;
type MappedRow = Record<string, string | undefined>;

@Injectable()
export class BulkImportTeachersUseCase {
  constructor(private readonly repo: TeacherRepository) {}

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
          identifier: rawRow.identifier,
          error: `Validation failed: ${messages}`,
        });
        continue;
      }

      try {
        const [dupUsername, dupNik, dupNip, dupNuptk] = await Promise.all([
          this.repo.findUserByIdentifier(dto.identifier),
          this.repo.findProfileByNik(dto.nik),
          dto.nip ? this.repo.findByNip(dto.nip) : null,
          dto.nuptk ? this.repo.findByNuptk(dto.nuptk) : null,
        ]);

        if (dupUsername) {
          results.push({
            row: rowNumber,
            status: 'FAILED',
            identifier: dto.identifier,
            error: `Identifier "${dto.identifier}" is already taken`,
          });
          continue;
        }

        if (dupNik) {
          results.push({
            row: rowNumber,
            status: 'FAILED',
            identifier: dto.identifier,
            error: `NIK "${dto.nik}" is already registered`,
          });
          continue;
        }

        if (dupNip) {
          results.push({
            row: rowNumber,
            status: 'FAILED',
            identifier: dto.identifier,
            error: `NIP "${dto.nip}" is already registered`,
          });
          continue;
        }

        if (dupNuptk) {
          results.push({
            row: rowNumber,
            status: 'FAILED',
            identifier: dto.identifier,
            error: `NUPTK "${dto.nuptk}" is already registered`,
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

        const hashedPassword = await hashPassword(dto.password);
        await this.repo.create(createDto, hashedPassword);

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
