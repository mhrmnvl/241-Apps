import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { ExportStudentQueryDto } from '../dto/request/export-student-query.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';

type ExcelRow = Record<string, ExcelJS.CellValue>;

@Injectable()
export class ExportStudentsUseCase {
  constructor(private readonly repo: StudentRepository) {}

  async execute(filters: ExportStudentQueryDto): Promise<Buffer> {
    const students = await this.repo.findAllForExport(filters);

    const rows = students.map((s) => {
      const user = s.user;
      const latestEnrollment = s.enrollments?.[0];
      const profile = user.profile;

      return {
        NIS: s.nis,
        NISN: s.nisn,
        Nama: profile?.name ?? '',
        NIK: profile?.nik ?? '',
        'Jenis Kelamin':
          profile?.gender === 'MALE'
            ? 'L'
            : profile?.gender === 'FEMALE'
              ? 'P'
              : '',
        'Tempat Lahir': profile?.birthPlace ?? '',
        'Tanggal Lahir': profile?.birthDate
          ? new Date(profile.birthDate).toISOString().split('T')[0]
          : '',
        Email: profile?.email ?? '',
        Telepon: profile?.phone ?? '',
        Tingkat: s.grade ? String(s.grade.level) : '',
        Kelas: latestEnrollment ? latestEnrollment.classroom.code : '',
        Status: s.status,
        Username: user.identifier,
        'Akun Aktif': user.isActive ? 'Aktif' : 'Nonaktif',
      };
    });

    return this.buildExcel(rows, 'Data Siswa');
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
        Username: '',
        Password: '',
      },
    ];
    return this.buildExcel(headers, 'Template Import Siswa');
  }
}
