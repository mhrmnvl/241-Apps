import type { SubjectGradeRow } from './calculate-subject-grades.js';

export interface ReportCardPdfViewModel {
  studentName: string;
  studentNis: string;
  className: string;
  semesterType: string;
  academicYearName: string;
  schoolName: string;
  schoolAddress: string;
  sickCount: number;
  excusedCount: number;
  absentCount: number;
  teacherNote: string | null;
  subjectsData: SubjectGradeRow[];
}

/** Compiles the A4 printer-friendly HTML string used to render the report card PDF. */
export function buildReportCardHtml(viewModel: ReportCardPdfViewModel): string {
  const {
    studentName,
    studentNis,
    className,
    semesterType,
    academicYearName,
    schoolName,
    schoolAddress,
    sickCount,
    excusedCount,
    absentCount,
    teacherNote,
    subjectsData,
  } = viewModel;

  return `
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
              ${teacherNote ?? '<span style="color: #999; font-style: italic;">Tidak ada catatan khusus dari Wali Kelas.</span>'}
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
}
