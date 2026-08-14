import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { CreateTeacherDto } from '../dto/request/create-teacher.dto.js';
import { TeacherQueryDto } from '../dto/request/teacher-query.dto.js';
import { ExportTeacherQueryDto } from '../dto/request/export-teacher-query.dto.js';
import { UpdateTeacherDto } from '../dto/request/update-teacher.dto.js';
import { BulkImportTeachersUseCase } from '../use-cases/bulk-import-teacher.use-case.js';
import { CreateTeacherUseCase } from '../use-cases/create-teacher.use-case.js';
import { DeleteTeacherUseCase } from '../use-cases/delete-teacher.use-case.js';
import { ExportTeachersUseCase } from '../use-cases/export-teacher.use-case.js';
import { GetTeacherByIdUseCase } from '../use-cases/get-teacher-by-id.use-case.js';
import { GetTeachersUseCase } from '../use-cases/get-teachers.use-case.js';
import { ResolveBulkImportConflictsUseCase } from '../use-cases/resolve-bulk-import-conflicts.use-case.js';
import { ToggleTeacherActiveUseCase } from '../use-cases/toggle-teacher-active.use-case.js';
import { UpdateTeacherProfileUseCase } from '../use-cases/update-teacher-profile.use-case.js';
import { UpdateTeacherUseCase } from '../use-cases/update-teacher.use-case.js';
import { TeacherController } from './teacher.controller.js';
import { TeacherImportExportController } from './teacher-import-export.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('TeacherController & TeacherImportExportController', () => {
  let controller: TeacherController;
  let importExportController: TeacherImportExportController;

  const mockGetTeachersUseCase = { execute: jest.fn() };
  const mockGetTeacherByIdUseCase = { execute: jest.fn() };
  const mockCreateTeacherUseCase = { execute: jest.fn() };
  const mockUpdateTeacherUseCase = { execute: jest.fn() };
  const mockDeleteTeacherUseCase = { execute: jest.fn() };
  const mockToggleTeacherActiveUseCase = { execute: jest.fn() };
  const mockUpdateProfileUseCase = { execute: jest.fn() };
  const mockBulkImportTeachersUseCase = { execute: jest.fn() };
  const mockResolveBulkImportConflictsUseCase = { execute: jest.fn() };
  const mockExportTeachersUseCase = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'usr-1',
    sub: 'usr-1',
    identifier: 'admin',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherImportExportController, TeacherController],
      providers: [
        { provide: GetTeachersUseCase, useValue: mockGetTeachersUseCase },
        {
          provide: GetTeacherByIdUseCase,
          useValue: mockGetTeacherByIdUseCase,
        },
        { provide: CreateTeacherUseCase, useValue: mockCreateTeacherUseCase },
        { provide: UpdateTeacherUseCase, useValue: mockUpdateTeacherUseCase },
        { provide: DeleteTeacherUseCase, useValue: mockDeleteTeacherUseCase },
        {
          provide: ToggleTeacherActiveUseCase,
          useValue: mockToggleTeacherActiveUseCase,
        },
        {
          provide: UpdateTeacherProfileUseCase,
          useValue: mockUpdateProfileUseCase,
        },
        {
          provide: BulkImportTeachersUseCase,
          useValue: mockBulkImportTeachersUseCase,
        },
        {
          provide: ResolveBulkImportConflictsUseCase,
          useValue: mockResolveBulkImportConflictsUseCase,
        },
        {
          provide: ExportTeachersUseCase,
          useValue: mockExportTeachersUseCase,
        },
      ],
    }).compile();

    controller = module.get<TeacherController>(TeacherController);
    importExportController = module.get<TeacherImportExportController>(
      TeacherImportExportController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(importExportController).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetTeachersUseCase with query', async () => {
      const query: TeacherQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetTeachersUseCase.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(mockGetTeachersUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetTeacherByIdUseCase with id', async () => {
      const id = 'emp-1';
      const expected = { id: 'emp-1', profile: { name: 'Budi Santoso' } };
      mockGetTeacherByIdUseCase.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id);

      expect(mockGetTeacherByIdUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateTeacherUseCase with dto', async () => {
      const dto = {
        identifier: 'guru001',
        name: 'Budi Santoso',
      } as CreateTeacherDto;
      const expected = { id: 'emp-new', profile: { name: 'Budi Santoso' } };
      mockCreateTeacherUseCase.execute.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockCreateTeacherUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('bulkImport', () => {
    it('should delegate buffer to BulkImportTeachersUseCase and return result', async () => {
      const fakeFile = {
        buffer: Buffer.from('fake-excel'),
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        originalname: 'teachers.xlsx',
      } as Express.Multer.File;

      const expected = {
        total: 2,
        success: 2,
        failed: 0,
        results: [
          { row: 2, status: 'SUCCESS', identifier: 'guru001' },
          { row: 3, status: 'SUCCESS', identifier: 'guru002' },
        ],
      };
      mockBulkImportTeachersUseCase.execute.mockResolvedValue(expected);

      const result = await importExportController.bulkImport(fakeFile);

      expect(mockBulkImportTeachersUseCase.execute).toHaveBeenCalledWith(
        fakeFile.buffer,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('export', () => {
    it('should return a StreamableFile wrapping the buffer from ExportTeachersUseCase', async () => {
      const fakeBuffer = Buffer.from('PK-fake-xlsx');
      mockExportTeachersUseCase.execute.mockResolvedValue(fakeBuffer);

      const query: ExportTeacherQueryDto = { search: 'Budi' };
      const result = await importExportController.export(query);

      expect(mockExportTeachersUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should delegate to UpdateTeacherUseCase with id and dto', async () => {
      const id = 'emp-1';
      const dto: UpdateTeacherDto = { nip: '198006152005011001' };
      const expected = { id: 'emp-1', nip: '198006152005011001' };
      mockUpdateTeacherUseCase.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(mockUpdateTeacherUseCase.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteTeacherUseCase with id', async () => {
      const id = 'emp-1';
      mockDeleteTeacherUseCase.execute.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockDeleteTeacherUseCase.execute).toHaveBeenCalledWith(id);
    });
  });

  describe('updateProfile', () => {
    it('should delegate to UpdateTeacherProfileUseCase with id and dto', async () => {
      const id = 'emp-1';
      const dto: UpdateProfileDto = { name: 'Budi Revised' };
      const expected = { id: 'p-1', name: 'Budi Revised' };
      mockUpdateProfileUseCase.execute.mockResolvedValue(expected);

      const result = await controller.updateProfile(id, dto);

      expect(mockUpdateProfileUseCase.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });
});
