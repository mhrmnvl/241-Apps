import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import ExcelJS from 'exceljs';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { IClassroomRepository } from '../../classroom/index.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { BulkImportStudentsUseCase } from './bulk-import-student.use-case.js';
import { ExcelStudentParser } from '../domain/interfaces/student-excel-parser.interface.js';
import { ExcelStudentParser as ConcreteExcelStudentParser } from '../infrastructure/parsers/excel-student.parser.js';

async function makeExcelBuffer(
  rows: Record<string, ExcelJS.CellValue>[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  if (rows.length > 0) {
    const keys = Object.keys(rows[0]);
    worksheet.columns = keys.map((key) => ({ header: key, key, width: 20 }));
    worksheet.addRows(rows);
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
const validRow = {
  NIS: '2024001',
  NISN: '0012345678',
  Nama: 'Ahmad Fauzi',
  NIK: '3578010101080001',
  'Jenis Kelamin': 'L',
  'Tempat Lahir': 'Malang',
  'Tanggal Lahir': '2008-01-01',
  Email: 'ahmad@test.com',
  Telepon: '081234567890',
  Kelas: 'VII-A',
  Username: 'siswa001',
  Password: 'P@ssw0rd!',
};

describe('BulkImportStudentsUseCase', () => {
  let useCase: BulkImportStudentsUseCase;

  const mockStudentRepository = {
    findByNis: jest.fn(),
    findByNisn: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockClassroomRepository = {
    findByCode: jest.fn(),
  };

  const mockClassroomLevelRepository = {
    findByLevel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkImportStudentsUseCase,
        { provide: IStudentRepository, useValue: mockStudentRepository },
        { provide: IClassroomRepository, useValue: mockClassroomRepository },
        {
          provide: IGradeRepository,
          useValue: mockClassroomLevelRepository,
        },
        { provide: ExcelStudentParser, useClass: ConcreteExcelStudentParser },
      ],
    }).compile();

    useCase = module.get<BulkImportStudentsUseCase>(BulkImportStudentsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw BadRequestException when file is empty', async () => {
      const emptyBuffer = await makeExcelBuffer([]);

      await expect(useCase.execute(emptyBuffer)).rejects.toThrow(
        BadRequestException,
      );
    });

    // The point of the whole use case: it reports, it does not write. The
    // preview dialog is only worth showing if the caller can still say no,
    // and this used to create every valid row as it walked the sheet.
    it('writes nothing, whatever the sheet says', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      });
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([
        validRow,
        { ...validRow, NIS: '2024002', NISN: '0012345679', Nama: '' },
      ]);
      await useCase.execute(buffer);

      expect(mockStudentRepository.create).not.toHaveBeenCalled();
      expect(mockStudentRepository.update).not.toHaveBeenCalled();
    });

    it('marks a valid new row SUCCESS, meaning it would be created', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      });
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.total).toBe(1);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results[0].status).toBe('SUCCESS');
      expect(mockClassroomRepository.findByCode).toHaveBeenCalledWith('VII-A');
    });

    it('should accept a PPDB student without classroom code', async () => {
      const ppdbRow = { ...validRow, Kelas: '' };
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([ppdbRow]);
      const result = await useCase.execute(buffer);

      expect(result.success).toBe(1);
      expect(mockClassroomRepository.findByCode).not.toHaveBeenCalled();
    });

    it('should fail row when classroom code is not found', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].status).toBe('FAILED');
      expect(result.results[0].error).toContain('not found');
    });

    it('should flag row as CONFLICT when NIS is duplicated', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      });
      mockStudentRepository.findByNis.mockResolvedValue({ id: 'stu-existing' });
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(0);
      expect(result.conflict).toBe(1);
      expect(result.results[0].status).toBe('CONFLICT');
      expect(result.results[0].existingId).toBe('stu-existing');
      expect(result.results[0].error).toContain('NIS');
    });

    it('should flag row as CONFLICT when NISN is duplicated', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      });
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue({
        id: 'stu-existing',
      });

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(0);
      expect(result.conflict).toBe(1);
      expect(result.results[0].status).toBe('CONFLICT');
      expect(result.results[0].existingId).toBe('stu-existing');
      expect(result.results[0].error).toContain('NISN');
    });

    it('should fail row when validation fails (missing required field)', async () => {
      const invalidRow = { ...validRow, Nama: '' };
      const buffer = await makeExcelBuffer([invalidRow]);

      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].error).toContain('Validation failed');
    });

    // Nothing is written while the sheet is walked, so the second of two rows
    // claiming one NIS looks as new as the first. Undetected here it passes
    // the preview and only blows up at apply time, after the caller has
    // already confirmed.
    // The second row is a CONFLICT, not a failure: the user gets the same
    // update/skip choice as for a student already in the database. It carries
    // no existingId because the row it collides with does not exist yet — the
    // apply step resolves that id after creating the first row.
    it('flags the second of two rows sharing a NIS as CONFLICT, naming the first row', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      });
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const twin = { ...validRow, NISN: '0012345679', Nama: 'Budi' };
      const buffer = await makeExcelBuffer([validRow, twin]);
      const result = await useCase.execute(buffer);

      expect(result.success).toBe(1);
      expect(result.conflict).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results[0].status).toBe('SUCCESS');
      expect(result.results[1].status).toBe('CONFLICT');
      expect(result.results[1].existingId).toBeUndefined();
      expect(result.results[1].error).toContain('duplicated in this file');
      expect(result.results[1].error).toContain('row 2');
    });

    it('flags the second of two rows sharing a NISN as CONFLICT', async () => {
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const first = { ...validRow, Kelas: '' };
      const twin = { ...first, NIS: '2024002' };
      const buffer = await makeExcelBuffer([first, twin]);
      const result = await useCase.execute(buffer);

      expect(result.success).toBe(1);
      expect(result.conflict).toBe(1);
      expect(result.results[1].status).toBe('CONFLICT');
      expect(result.results[1].error).toContain('NISN');
      expect(result.results[1].error).toContain('duplicated in this file');
    });

    // A duplicate row that is also invalid stays FAILED: offering to apply it
    // would only produce an error at write time.
    it('keeps an invalid duplicate row FAILED rather than offering a choice', async () => {
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const first = { ...validRow, Kelas: '' };
      const twin = { ...first, NISN: '0012345679', Nama: '' };
      const buffer = await makeExcelBuffer([first, twin]);
      const result = await useCase.execute(buffer);

      expect(result.results[1].status).toBe('FAILED');
      expect(result.results[1].error).toContain('Validation failed');
    });

    it('should look up a repeated classroom code only once across rows', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      });
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const row2 = { ...validRow, NIS: '2024002', NISN: '0012345679' };
      const buffer = await makeExcelBuffer([validRow, row2]);
      const result = await useCase.execute(buffer);

      expect(result.success).toBe(2);
      expect(mockClassroomRepository.findByCode).toHaveBeenCalledTimes(1);
    });

    it('should correctly number rows starting at 2 (row 1 = header)', async () => {
      const ppdbRow = { ...validRow, Kelas: '' };
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([ppdbRow]);
      const result = await useCase.execute(buffer);

      expect(result.results[0].row).toBe(2);
    });
  });
});
