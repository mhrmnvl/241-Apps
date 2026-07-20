import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { GetSchoolUnitUseCase } from '../../../platform/school-unit/index.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { PdfService } from '../services/pdf.service.js';

@Injectable()
export class ExportReportCardPdfUseCase {
  constructor(
    private readonly repo: IReportCardRepository,
    private readonly pdfService: PdfService,
    private readonly prisma: PrismaService,
    private readonly getSchoolUnitUseCase: GetSchoolUnitUseCase,
  ) {}

  async execute(id: string): Promise<Buffer> {
    const reportCard = await this.repo.findById(id);
    if (!reportCard) {
      throw new NotFoundException('Rapor tidak ditemukan');
    }

    if (!reportCard.isPublished) {
      throw new BadRequestException('Rapor belum dipublikasikan');
    }

    // Fetch all student scores for this enrollment including assessment items and subjects
    const scores = await this.prisma.studentScore.findMany({
      where: {
        enrollmentId: reportCard.enrollmentId,
        deletedAt: null,
      },
      include: {
        assessmentItem: {
          include: {
            teachingAssignment: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    // Fetch attendance data
    const attendances = await this.prisma.attendance.findMany({
      where: {
        enrollmentId: reportCard.enrollmentId,
        deletedAt: null,
      },
    });

    // Aggregate attendance counts
    let sickCount = 0;
    let excusedCount = 0;
    let absentCount = 0;

    for (const att of attendances) {
      if (att.status === 'SICK') sickCount++;
      else if (att.status === 'EXCUSED') excusedCount++;
      else if (att.status === 'ABSENT') absentCount++;
    }

    // Fetch School Unit info
    let schoolName = 'SIAKAD Sekolah';
    let schoolAddress = '';
    try {
      const schoolUnit = await this.getSchoolUnitUseCase.execute();
      schoolName = schoolUnit.name;
      schoolAddress = schoolUnit.email ?? schoolUnit.phone ?? '';
    } catch {
      // Use default values if school unit not set up yet
    }

    // Group scores by subject to calculate average per subject
    const subjectGradesMap = new Map<
      string,
      { subjectName: string; subjectCode: string; scoresList: number[] }
    >();
    for (const s of scores) {
      const subject = s.assessmentItem?.teachingAssignment?.subject;
      if (!subject || s.score === null || s.score === undefined) continue;

      const existing = subjectGradesMap.get(subject.id);
      if (existing) {
        existing.scoresList.push(s.score);
      } else {
        subjectGradesMap.set(subject.id, {
          subjectName: subject.name,
          subjectCode: subject.code ?? '',
          scoresList: [s.score],
        });
      }
    }

    const subjectsData = Array.from(subjectGradesMap.values()).map(
      (
        subj: {
          subjectName: string;
          subjectCode: string;
          scoresList: number[];
        },
        index: number,
      ) => {
        const avg =
          subj.scoresList.reduce((sum: number, val: number) => sum + val, 0) /
          subj.scoresList.length;

        // Determine predicate/grade
        let predicate: string;
        let description: string;
        if (avg >= 90) {
          predicate = 'A';
          description = 'Sangat Baik';
        } else if (avg >= 80) {
          predicate = 'B';
          description = 'Baik';
        } else if (avg >= 70) {
          predicate = 'C';
          description = 'Cukup';
        } else {
          predicate = 'D';
          description = 'Kurang';
        }

        return {
          no: index + 1,
          code: subj.subjectCode,
          name: subj.subjectName,
          score: avg.toFixed(2),
          predicate,
          description,
        };
      },
    );

    const studentName =
      reportCard.enrollment?.student?.user?.profile?.name ?? '-';
    const studentNis = reportCard.enrollment?.student?.nis ?? '-';
    const className = reportCard.enrollment?.classroom?.name ?? '-';
    const semesterType =
      reportCard.enrollment?.semester?.type?.name === 'ODD'
        ? '1 (Ganjil)'
        : '2 (Genap)';
    const academicYearName =
      reportCard.enrollment?.semester?.academicYear?.name ?? '-';

    // Compile A4 printer-friendly HTML string
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapor Siswa - ${studentName}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .header-table td {
            vertical-align: top;
            padding: 3px 0;
          }
          .header-title {
            text-align: center;
            margin-bottom: 30px;
          }
          .header-title h2 {
            margin: 0 0 5px 0;
            font-size: 16px;
            text-transform: uppercase;
          }
          .header-title p {
            margin: 0;
            font-size: 11px;
            color: #666;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .data-table th, .data-table td {
            border: 1px solid #000;
            padding: 8px 6px;
            text-align: left;
          }
          .data-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
          }
          .text-center {
            text-align: center !important;
          }
          .text-right {
            text-align: right !important;
          }
          .attendance-table {
            width: 50%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .attendance-table th, .attendance-table td {
            border: 1px solid #000;
            padding: 6px;
          }
          .attendance-table th {
            background-color: #f2f2f2;
          }
          .note-box {
            border: 1px solid #000;
            padding: 10px;
            margin-bottom: 30px;
            min-height: 60px;
          }
          .signature-section {
            width: 100%;
            margin-top: 50px;
          }
          .signature-col {
            width: 33.33%;
            float: left;
            text-align: center;
          }
          .signature-space {
            height: 70px;
          }
          .clear {
            clear: both;
          }
        </style>
      </head>
      <body>
        <div class="header-title">
          <h2>PENCAPAIAN HASIL BELAJAR SISWA</h2>
          <p>${schoolName}</p>
          <p style="font-style: italic;">${schoolAddress}</p>
        </div>

        <table class="header-table">
          <tr>
            <td style="width: 15%;">Nama Siswa</td>
            <td style="width: 2%;">:</td>
            <td style="width: 48%; font-weight: bold;">${studentName}</td>
            <td style="width: 15%;">Kelas</td>
            <td style="width: 2%;">:</td>
            <td style="width: 18%;">${className}</td>
          </tr>
          <tr>
            <td>NIS</td>
            <td>:</td>
            <td>${studentNis}</td>
            <td>Semester</td>
            <td>:</td>
            <td>${semesterType}</td>
          </tr>
          <tr>
            <td>Sekolah</td>
            <td>:</td>
            <td>${schoolName}</td>
            <td>Tahun Ajaran</td>
            <td>:</td>
            <td>${academicYearName}</td>
          </tr>
        </table>

        <h3 style="font-size: 13px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px;">A. NILAI MATA PELAJARAN</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 5%;">No</th>
              <th style="width: 15%;">Kode</th>
              <th style="width: 40%;">Mata Pelajaran</th>
              <th style="width: 12%;">Nilai Akhir</th>
              <th style="width: 10%;">Predikat</th>
              <th style="width: 18%;">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            ${
              subjectsData.length > 0
                ? subjectsData
                    .map(
                      (s) => `
              <tr>
                <td class="text-center">${s.no}</td>
                <td class="text-center">${s.code}</td>
                <td>${s.name}</td>
                <td class="text-center" style="font-weight: bold;">${s.score}</td>
                <td class="text-center">${s.predicate}</td>
                <td>${s.description}</td>
              </tr>
            `,
                    )
                    .join('')
                : `<tr><td colspan="6" class="text-center" style="font-style: italic;">Belum ada data nilai pelajaran.</td></tr>`
            }
          </tbody>
        </table>

        <div style="margin-top: 30px;">
          <div style="width: 45%; float: left;">
            <h3 style="font-size: 13px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px;">B. KETIDAKHADIRAN</h3>
            <table class="attendance-table" style="width: 100%;">
              <tr>
                <td style="width: 60%;">Sakit</td>
                <td class="text-center" style="width: 40%; font-weight: bold;">${sickCount} Hari</td>
              </tr>
              <tr>
                <td>Izin</td>
                <td class="text-center" style="font-weight: bold;">${excusedCount} Hari</td>
              </tr>
              <tr>
                <td>Tanpa Keterangan (Alfa)</td>
                <td class="text-center" style="font-weight: bold;">${absentCount} Hari</td>
              </tr>
            </table>
          </div>

          <div style="width: 50%; float: right;">
            <h3 style="font-size: 13px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px;">C. CATATAN WALI KELAS</h3>
            <div class="note-box">
              ${reportCard.teacherNote ?? '<span style="color: #999; font-style: italic;">Tidak ada catatan khusus dari Wali Kelas.</span>'}
            </div>
          </div>
          <div class="clear"></div>
        </div>

        <div class="signature-section">
          <div class="signature-col">
            <p>Mengetahui,</p>
            <p>Orang Tua/Wali Siswa</p>
            <div class="signature-space"></div>
            <p style="border-bottom: 1px solid #000; display: inline-block; min-width: 150px;">...................................</p>
          </div>
          <div class="signature-col">
            <p>&nbsp;</p>
            <p>Wali Kelas</p>
            <div class="signature-space"></div>
            <p style="border-bottom: 1px solid #000; display: inline-block; min-width: 150px; font-weight: bold;">...................................</p>
          </div>
          <div class="signature-col">
            <p>Mengetahui,</p>
            <p>Kepala Sekolah</p>
            <div class="signature-space"></div>
            <p style="border-bottom: 1px solid #000; display: inline-block; min-width: 150px; font-weight: bold;">...................................</p>
          </div>
          <div class="clear"></div>
        </div>
      </body>
      </html>
    `;

    return this.pdfService.generatePdf(htmlContent);
  }
}
