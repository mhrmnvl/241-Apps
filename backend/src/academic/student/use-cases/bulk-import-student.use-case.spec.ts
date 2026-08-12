import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import ExcelJS from 'exceljs';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { IClassroomRepository } from '../../classroom/index.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { BulkImportStudentsUseCase } from './bulk-import-student.use-case.js';
import { CreateStudentUseCase } from './create-student.use-case.js';
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
  };

  const mockClassroomRepository = {
    findByCode: jest.fn(),
  };

  const mockClassroomLevelRepository = {
    findByLevel: jest.fn(),
  };

  const mockCreateStudent = {
    execute: jest.fn(),
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
        { provide: CreateStudentUseCase, useValue: mockCreateStudent },
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

    it('should import a valid row with classroom code successfully', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      });
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);
      mockCreateStudent.execute.mockResolvedValue({ id: 'stu-1' });

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.total).toBe(1);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results[0].status).toBe('SUCCESS');
      expect(mockClassroomRepository.findByCode).toHaveBeenCalledWith('VII-A');
      expect(mockCreateStudent.execute).toHaveBeenCalledWith(
        expect.objectContaining({ classroomId: 'cls-1' }),
      );
    });

    it('should import a PPDB student without classroom code', async () => {
      const ppdbRow = { ...validRow, Kelas: '' };
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);
      mockCreateStudent.execute.mockResolvedValue({ id: 'stu-2' });

      const buffer = await makeExcelBuffer([ppdbRow]);
      const result = await useCase.execute(buffer);

      expect(result.success).toBe(1);
      expect(mockClassroomRepository.findByCode).not.toHaveBeenCalled();
      expect(mockCreateStudent.execute).toHaveBeenCalledWith(
        expect.objectContaining({ classroomId: undefined }),
      );
    });

    it('should fail row when classroom code is not found', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].status).toBe('FAILED');
      expect(result.results[0].error).toContain('not found');
      expect(mockCreateStudent.execute).not.toHaveBeenCalled();
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
      expect(mockCreateStudent.execute).not.toHaveBeenCalled();
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
      expect(mockCreateStudent.execute).not.toHaveBeenCalled();
    });

    it('should fail row when validation fails (missing required field)', async () => {
      const invalidRow = { ...validRow, Nama: '' };
      const buffer = await makeExcelBuffer([invalidRow]);

      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].error).toContain('Validation failed');
      expect(mockCreateStudent.execute).not.toHaveBeenCalled();
    });

    it('should fail the row with the specific error message when creation throws', async () => {
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);
      mockCreateStudent.execute.mockRejectedValue(
        new Error('Database connection lost'),
      );

      const ppdbRow = { ...validRow, Kelas: '' };
      const buffer = await makeExcelBuffer([ppdbRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].status).toBe('FAILED');
      expect(result.results[0].error).toBe('Database connection lost');
    });

    it('should look up a repeated classroom code only once across rows', async () => {
      mockClassroomRepository.findByCode.mockResolvedValue({
        id: 'cls-1',
        code: 'VII-A',
        gradeId: 'lvl-7',
      });
      mockStudentRepository.findByNis.mockResolvedValue(null);
      mockStudentRepository.findByNisn.mockResolvedValue(null);
      mockCreateStudent.execute.mockResolvedValue({ id: 'stu-1' });

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
      mockCreateStudent.execute.mockResolvedValue({ id: 'stu-1' });

      const buffer = await makeExcelBuffer([ppdbRow]);
      const result = await useCase.execute(buffer);

      expect(result.results[0].row).toBe(2);
    });
  });
});
