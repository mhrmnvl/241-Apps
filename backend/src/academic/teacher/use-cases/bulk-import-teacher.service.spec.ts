import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import ExcelJS from 'exceljs';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { BulkImportTeachersUseCase } from './bulk-import-teacher.use-case.js';

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
  identifier: 'guru001',
  password: 'P@ssw0rd!',
  name: 'Budi Santoso',
  nik: '3578010101700001',
  gender: 'MALE',
  birthPlace: 'Surabaya',
  birthDate: '1980-06-15',
  email: 'budi@test.com',
  phone: '081298765432',
  nip: '198006152005011001',
  nuptk: '1234567890123456',
  employmentStatus: 'PNS',
};

describe('BulkImportTeachersUseCase', () => {
  let useCase: BulkImportTeachersUseCase;

  const mockRepo = {
    findUserByIdentifier: jest.fn(),
    findProfileByNik: jest.fn(),
    findByNip: jest.fn(),
    findByNuptk: jest.fn(),
    resolveEmploymentTypeId: jest.fn().mockResolvedValue('employment-type-id'),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkImportTeachersUseCase,
        { provide: TeacherRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<BulkImportTeachersUseCase>(BulkImportTeachersUseCase);
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

    it('should import a valid row successfully', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: 'emp-1' });

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.total).toBe(1);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results[0].status).toBe('SUCCESS');
      expect(result.results[0].row).toBe(2);
      expect(mockRepo.findUserByIdentifier).toHaveBeenCalledWith('guru001');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
      );
    });

    it('should fail row when identifier is duplicated', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue({ id: 'user-existing' });
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].error).toContain('Identifier');
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should fail row when NIK is duplicated', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue({ userId: 'user-existing' });
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].error).toContain('NIK');
    });

    it('should fail row when NIP is duplicated', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue({ id: 'emp-existing' });
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].error).toContain('NIP');
    });

    it('should fail row when NUPTK is duplicated', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue({ id: 'emp-existing' });

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].error).toContain('NUPTK');
    });

    it('should fail row when validation fails (missing required field)', async () => {
      const invalidRow = { ...validRow, name: '' };
      const buffer = await makeExcelBuffer([invalidRow]);

      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].error).toContain('Validation failed');
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should skip NIP/NUPTK duplicate check when fields are absent', async () => {
      const rowWithoutNipNuptk = {
        ...validRow,
        nip: undefined,
        nuptk: undefined,
      };
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: 'emp-1' });

      const buffer = await makeExcelBuffer([rowWithoutNipNuptk]);
      const result = await useCase.execute(buffer);

      expect(mockRepo.findByNip).not.toHaveBeenCalled();
      expect(mockRepo.findByNuptk).not.toHaveBeenCalled();
      expect(result.success).toBe(1);
    });

    it('should process multiple rows and report partial success', async () => {
      const row2 = {
        ...validRow,
        identifier: 'guru002',
        nik: '9999000000000002',
        nip: '111',
      };

      mockRepo.findUserByIdentifier
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'dup' });
      mockRepo.findProfileByNik
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockRepo.findByNip
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockRepo.findByNuptk
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockRepo.create.mockResolvedValue({ id: 'emp-1' });

      const buffer = await makeExcelBuffer([validRow, row2]);
      const result = await useCase.execute(buffer);

      expect(result.total).toBe(2);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results[0].status).toBe('SUCCESS');
      expect(result.results[1].status).toBe('FAILED');
    });

    it('should correctly number rows starting at 2 (row 1 = header)', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ id: 'emp-1' });

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.results[0].row).toBe(2);
    });
  });
});
