import { Injectable, BadRequestException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { BulkImportTeacherRowDto } from '../../dto/request/bulk-import-teacher.dto.js';
import { ExcelTeacherParser as IExcelTeacherParser } from '../../domain/interfaces/teacher-excel-parser.interface.js';

type ExcelRow = Record<string, ExcelJS.CellValue>;
type MappedRow = Record<string, string | undefined>;

@Injectable()
export class ExcelTeacherParser implements IExcelTeacherParser {
  async parse(buffer: Buffer): Promise<BulkImportTeacherRowDto[]> {
    const rows = await this.parseExcel(buffer);

    if (rows.length === 0) {
      throw new BadRequestException(
        'Excel file is empty or has no valid data rows',
      );
    }

    return rows.map((row) => {
      const rawRow = this.mapColumns(row);
      return rawRow as unknown as BulkImportTeacherRowDto;
    });
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
