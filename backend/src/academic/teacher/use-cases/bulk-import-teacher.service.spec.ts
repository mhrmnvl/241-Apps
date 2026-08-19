import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import ExcelJS from 'exceljs';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';
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

import { ExcelTeacherParser } from '../domain/interfaces/teacher-excel-parser.interface.js';
import { ExcelTeacherParser as ConcreteExcelTeacherParser } from '../infrastructure/parsers/excel-teacher.parser.js';

describe('BulkImportTeachersUseCase', () => {
  let useCase: BulkImportTeachersUseCase;

  const mockRepo = {
    findUserByIdentifier: jest.fn(),
    findProfileByNik: jest.fn(),
    findByUserId: jest.fn(),
    findByNip: jest.fn(),
    findByNuptk: jest.fn(),
    resolveEmploymentTypeId: jest.fn().mockResolvedValue('employment-type-id'),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkImportTeachersUseCase,
        { provide: ExcelTeacherParser, useClass: ConcreteExcelTeacherParser },
        { provide: ITeacherRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<BulkImportTeachersUseCase>(BulkImportTeachersUseCase);
    jest.clearAllMocks();
    // clearAllMocks wipes call records, not implementations — restore the
    // default here so a test that overrides it cannot leak into the next one.
    mockRepo.resolveEmploymentTypeId.mockResolvedValue('employment-type-id');
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
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([
        validRow,
        { ...validRow, identifier: 'guru002', nip: '222', name: '' },
      ]);
      await useCase.execute(buffer);

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('marks a valid new row SUCCESS, meaning it would be created', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.total).toBe(1);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results[0].status).toBe('SUCCESS');
      expect(result.results[0].row).toBe(2);
      expect(mockRepo.findUserByIdentifier).toHaveBeenCalledWith('guru001');
    });

    it('fails the row when its employment type code does not resolve', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);
      mockRepo.resolveEmploymentTypeId.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].status).toBe('FAILED');
      expect(result.results[0].error).toContain('Employment type');
    });

    // Nothing is written while the sheet is walked, so the second of two rows
    // claiming one identity looks as new as the first. Undetected here it
    // passes the preview and only blows up at apply time, after the caller
    // has already confirmed.
    // NIP, NUPTK and NIK are re-resolvable at apply time, so a repeat within
    // the file becomes a choice rather than a failure.
    it('flags the second of two rows sharing a NIP as CONFLICT, naming the first row', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const twin = {
        ...validRow,
        identifier: 'guru002',
        nik: '9999000000000002',
        nuptk: '9999999999999999',
      };
      const buffer = await makeExcelBuffer([validRow, twin]);
      const result = await useCase.execute(buffer);

      expect(result.success).toBe(1);
      expect(result.conflict).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results[1].status).toBe('CONFLICT');
      expect(result.results[1].existingId).toBeUndefined();
      expect(result.results[1].error).toContain('NIP');
      expect(result.results[1].error).toContain('duplicated in this file');
      expect(result.results[1].error).toContain('row 2');
    });

    it('fails the second of two rows sharing a username', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const twin = {
        ...validRow,
        nik: '9999000000000002',
        nip: '999',
        nuptk: '9999999999999999',
      };
      const buffer = await makeExcelBuffer([validRow, twin]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[1].error).toContain('Username');
      expect(result.results[1].error).toContain('duplicated in this file');
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
    });

    it('should flag row as CONFLICT when NIK is duplicated', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue({ userId: 'user-existing' });
      mockRepo.findByUserId.mockResolvedValue({ id: 'emp-existing' });
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(0);
      expect(result.conflict).toBe(1);
      expect(result.results[0].status).toBe('CONFLICT');
      expect(result.results[0].existingId).toBe('emp-existing');
      expect(result.results[0].error).toContain('NIK');
    });

    it('should flag row as CONFLICT when NIP is duplicated', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue({ id: 'emp-existing' });
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(0);
      expect(result.conflict).toBe(1);
      expect(result.results[0].status).toBe('CONFLICT');
      expect(result.results[0].existingId).toBe('emp-existing');
      expect(result.results[0].error).toContain('NIP');
    });

    it('should flag row as CONFLICT when NUPTK is duplicated', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue({ id: 'emp-existing' });

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(0);
      expect(result.conflict).toBe(1);
      expect(result.results[0].status).toBe('CONFLICT');
      expect(result.results[0].existingId).toBe('emp-existing');
      expect(result.results[0].error).toContain('NUPTK');
    });

    it('should fail row when validation fails (missing required field)', async () => {
      const invalidRow = { ...validRow, name: '' };
      const buffer = await makeExcelBuffer([invalidRow]);

      const result = await useCase.execute(buffer);

      expect(result.failed).toBe(1);
      expect(result.results[0].error).toContain('Validation failed');
    });

    it('should skip NIP/NUPTK duplicate check when fields are absent', async () => {
      const rowWithoutNipNuptk = {
        ...validRow,
        nip: undefined,
        nuptk: undefined,
      };
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([rowWithoutNipNuptk]);
      const result = await useCase.execute(buffer);

      expect(mockRepo.findByNip).not.toHaveBeenCalled();
      expect(mockRepo.findByNuptk).not.toHaveBeenCalled();
      expect(result.success).toBe(1);
    });

    it('should process multiple rows and report partial success', async () => {
      // Every identity distinct from row 1's, so the failure below is the
      // database duplicate this test is about and not an in-file collision.
      const row2 = {
        ...validRow,
        identifier: 'guru002',
        nik: '9999000000000002',
        nip: '111',
        nuptk: '9999999999999999',
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

      const buffer = await makeExcelBuffer([validRow, row2]);
      const result = await useCase.execute(buffer);

      expect(result.total).toBe(2);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results[0].status).toBe('SUCCESS');
      expect(result.results[1].status).toBe('FAILED');
    });

    it('should resolve a repeated employment type code only once across rows', async () => {
      const row2 = {
        ...validRow,
        identifier: 'guru002',
        nik: '9999000000000002',
        nip: '999',
        nuptk: '9999999999999999',
      };
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow, row2]);
      const result = await useCase.execute(buffer);

      expect(result.success).toBe(2);
      expect(mockRepo.resolveEmploymentTypeId).toHaveBeenCalledTimes(1);
    });

    it('should correctly number rows starting at 2 (row 1 = header)', async () => {
      mockRepo.findUserByIdentifier.mockResolvedValue(null);
      mockRepo.findProfileByNik.mockResolvedValue(null);
      mockRepo.findByNip.mockResolvedValue(null);
      mockRepo.findByNuptk.mockResolvedValue(null);

      const buffer = await makeExcelBuffer([validRow]);
      const result = await useCase.execute(buffer);

      expect(result.results[0].row).toBe(2);
    });
  });
});
