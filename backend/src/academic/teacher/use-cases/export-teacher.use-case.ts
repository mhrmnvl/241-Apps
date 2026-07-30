import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ExportTeacherQueryDto } from '../dto/request/export-teacher-query.dto.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';

import { mapTeacherToExportRow } from '../constants/teacher-export-columns.js';

declare module 'exceljs' {
  interface Worksheet {
    dataValidations: {
      add(range: string, validation: ExcelJS.DataValidation): void;
    };
  }
}

type ExcelRow = Record<string, ExcelJS.CellValue>;

@Injectable()
export class ExportTeachersUseCase {
  constructor(private readonly teacherRepository: TeacherRepository) {}

  async execute(filters: ExportTeacherQueryDto): Promise<Buffer> {
    const teachers = await this.teacherRepository.findAllForExport(filters);
    const rows = teachers.map(mapTeacherToExportRow);
    return this.buildExcel(rows, 'Teachers');
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

  async buildImportTemplate(): Promise<Buffer> {
    const headers = [
      {
        Nama: '',
        NIK: '',
        NIP: '',
        NUPTK: '',
        'Status Kepegawaian': '',
        'Jenis Kelamin': '',
        'Tempat Lahir': '',
        'Tanggal Lahir': '',
        Email: '',
        Telepon: '',
        Identifier: '',
        Password: '',
      },
    ];

    const activeCodes =
      await this.teacherRepository.getActiveEmploymentTypeCodes();
    const empFormula =
      activeCodes.length > 0
        ? `"${activeCodes.join(',')}"`
        : '"PNS,PPPK,NON_ASN"';
    const sampleEmp = activeCodes.length > 0 ? activeCodes[0] : 'NON_ASN';

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template Import Pegawai');

    const keys = Object.keys(headers[0]);
    worksheet.columns = keys.map((key) => ({
      header: key,
      key,
      width: 20,
    }));
    worksheet.addRows(headers);

    // Set placeholder values on row 2
    const row2 = worksheet.getRow(2);
    row2.getCell('Status Kepegawaian').value = sampleEmp;
    row2.getCell('Jenis Kelamin').value = 'L';
    row2.getCell('Tanggal Lahir').value = '1990-01-01';

    // Add Data Validation for Status Kepegawaian (Col E) on rows 2 to 1000
    worksheet.dataValidations.add('E2:E1000', {
      type: 'list',
      allowBlank: true,
      formulae: [empFormula],
      showErrorMessage: true,
      errorTitle: 'Pilihan Tidak Valid',
      error: 'Silakan pilih status kepegawaian yang valid dan aktif di sistem.',
    });

    // Add Data Validation for Jenis Kelamin (Col F) on rows 2 to 1000
    worksheet.dataValidations.add('F2:F1000', {
      type: 'list',
      allowBlank: true,
      formulae: ['"L,P"'],
      showErrorMessage: true,
      errorTitle: 'Pilihan Tidak Valid',
      error: 'Silakan pilih L (Laki-laki) atau P (Perempuan).',
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
