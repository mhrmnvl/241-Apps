import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ExportTeacherQueryDto } from '../dto/request/export-teacher-query.dto.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';

type ExcelRow = Record<string, ExcelJS.CellValue>;

@Injectable()
export class ExportTeachersUseCase {
  constructor(private readonly repo: TeacherRepository) {}

  async execute(filters: ExportTeacherQueryDto): Promise<Buffer> {
    const teachers = await this.repo.findAllForExport(filters);

    const rows = teachers.map((e) => ({
      Nama: e.user.profile?.name ?? '',
      NIK: e.user.profile?.nik ?? '',
      NIP: e.nip ?? '',
      NUPTK: e.nuptk ?? '',
      'Status Kepegawaian': e.employmentType?.name ?? '',
      'Jenis Kelamin':
        e.user.profile?.gender === 'MALE'
          ? 'L'
          : e.user.profile?.gender === 'FEMALE'
            ? 'P'
            : '',
      'Tempat Lahir': e.user.profile?.birthPlace ?? '',
      'Tanggal Lahir': e.user.profile?.birthDate
        ? new Date(e.user.profile.birthDate).toISOString().split('T')[0]
        : '',
      Email: e.user.profile?.email ?? '',
      Telepon: e.user.profile?.phone ?? '',
      Jabatan: e.teacherPositions?.[0]?.position?.name ?? '',
      Username: e.user.identifier,
      Status: e.user.isActive ? 'Aktif' : 'Nonaktif',
    }));

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
        'Status Kepegawaian': 'PNS | PPPK | NON_ASN',
        'Jenis Kelamin': 'L | P',
        'Tempat Lahir': '',
        'Tanggal Lahir': 'YYYY-MM-DD',
        Email: '',
        Telepon: '',
        Username: '',
        Password: '',
      },
    ];
    return this.buildExcel(headers, 'Template Import Pegawai');
  }
}
