import { Injectable, BadRequestException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { StudentImportRow } from '../../domain/entities/student-import-row.entity.js';
import { ExcelStudentParser as IExcelStudentParser } from '../../domain/interfaces/student-excel-parser.interface.js';

type ExcelRow = Record<string, ExcelJS.CellValue>;

@Injectable()
export class ExcelStudentParser implements IExcelStudentParser {
  async parse(buffer: Buffer): Promise<StudentImportRow[]> {
    const rows = await this.parseExcel(buffer);

    if (rows.length === 0) {
      throw new BadRequestException(
        'Excel file is empty or has no valid data rows',
      );
    }

    return rows.map((row) => this.mapColumns(row));
  }

  private mapColumns(row: ExcelRow): StudentImportRow {
    const pick = (...keys: string[]): ExcelJS.CellValue =>
      keys.reduce<ExcelJS.CellValue>((val, k) => val ?? row[k], undefined);

    const str = (...keys: string[]): string => {
      const v = pick(...keys);
      if (typeof v === 'string') return v.trim();
      if (typeof v === 'number') return String(v).trim();
      return '';
    };

    const rawGender = str('Jenis Kelamin', 'Gender', 'gender').toUpperCase();
    const gender =
      rawGender === 'L'
        ? 'MALE'
        : rawGender === 'P'
          ? 'FEMALE'
          : rawGender || undefined;

    const rawLevel = pick('Tingkat', 'Level', 'grade');
    const grade =
      typeof rawLevel === 'number'
        ? rawLevel
        : typeof rawLevel === 'string' && rawLevel.trim()
          ? Number(rawLevel.trim()) || undefined
          : undefined;

    const classroomCode =
      str(
        'Kelas',
        'Classroom Code',
        'classroomCode',
        'Rombel',
        'Rombongan Belajar',
      ) || undefined;

    const nis = str('NIS', 'nis');
    const identifier =
      str('Identifier', 'identifier', 'Username', 'username') || nis;
    const password = str('Password', 'password') || nis;

    return {
      identifier,
      password,
      name: str('Nama', 'Name', 'name'),
      nik: str('NIK', 'nik'),
      gender,
      birthPlace: str('Tempat Lahir', 'Birth Place', 'birthPlace'),
      birthDate: str('Tanggal Lahir', 'Birth Date', 'birthDate'),
      email: str('Email', 'email') || undefined,
      phone: str('Telepon', 'Phone', 'phone') || undefined,
      grade,
      classroomCode,
      nis,
      nisn: str('NISN', 'nisn'),
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

  async buildImportTemplate(): Promise<Buffer> {
    const headers = [
      {
        NIS: '',
        NISN: '',
        Nama: '',
        NIK: '',
        'Jenis Kelamin': 'L | P',
        'Tempat Lahir': '',
        'Tanggal Lahir': 'YYYY-MM-DD',
        Email: '',
        Telepon: '',
        Tingkat: '7 | 8 | 9',
        Kelas: '(opsional) VIII-A | IX-B',
        Username: '',
        Password: '',
      },
    ];
    return this.buildExcel(headers, 'Template Import Siswa');
  }

  private async buildExcel(
    rows: ExcelRow[],
    sheetName: string,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (rows.length > 0) {
      const keys = Object.keys(rows[0]);
      worksheet.columns = keys.map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      worksheet.addRows(rows);
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
