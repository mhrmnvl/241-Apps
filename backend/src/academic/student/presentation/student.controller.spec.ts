import { Test, TestingModule } from '@nestjs/testing';
import { UserGender } from '@prisma/client';
import { CreateStudentDto } from '../dto/request/create-student.dto.js';
import { ExportStudentQueryDto } from '../dto/request/export-student-query.dto.js';
import { StudentQueryDto } from '../dto/request/student-query.dto.js';
import { UpdateStudentDto } from '../dto/request/update-student.dto.js';
import { BulkImportStudentsUseCase } from '../use-cases/bulk-import-student.use-case.js';
import { CreateStudentUseCase } from '../use-cases/create-student.use-case.js';
import { DeleteStudentUseCase } from '../use-cases/delete-student.use-case.js';
import { ExportStudentsUseCase } from '../use-cases/export-student.use-case.js';
import { GetStudentByIdUseCase } from '../use-cases/get-student-by-id.use-case.js';
import { GetStudentsUseCase } from '../use-cases/get-students.use-case.js';
import { ToggleStudentActiveUseCase } from '../use-cases/toggle-student-active.use-case.js';
import { UpdateStudentUseCase } from '../use-cases/update-student.use-case.js';
import { StudentController } from './student.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('StudentController', () => {
  let controller: StudentController;

  const mockGetStudentsService = { execute: jest.fn() };
  const mockGetStudentByIdService = { execute: jest.fn() };
  const mockCreateStudentService = { execute: jest.fn() };
  const mockUpdateStudentService = { execute: jest.fn() };
  const mockDeleteStudentService = { execute: jest.fn() };
  const mockToggleStudentActiveService = { execute: jest.fn() };
  const mockBulkImportStudentsService = { execute: jest.fn() };
  const mockExportStudentsService = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'usr-1',
    sub: 'usr-1',
    identifier: 'admin',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        { provide: GetStudentsUseCase, useValue: mockGetStudentsService },
        { provide: GetStudentByIdUseCase, useValue: mockGetStudentByIdService },
        { provide: CreateStudentUseCase, useValue: mockCreateStudentService },
        { provide: UpdateStudentUseCase, useValue: mockUpdateStudentService },
        { provide: DeleteStudentUseCase, useValue: mockDeleteStudentService },
        {
          provide: ToggleStudentActiveUseCase,
          useValue: mockToggleStudentActiveService,
        },
        {
          provide: BulkImportStudentsUseCase,
          useValue: mockBulkImportStudentsService,
        },
        {
          provide: ExportStudentsUseCase,
          useValue: mockExportStudentsService,
        },
      ],
    }).compile();

    controller = module.get<StudentController>(StudentController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetStudentsUseCase with query', async () => {
      const query: StudentQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
      mockGetStudentsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser, query);

      expect(mockGetStudentsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetStudentByIdUseCase with id and user', async () => {
      const id = 'stu-1';
      const expected = { id: 'stu-1', nis: '2024001' };
      mockGetStudentByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(mockUser, id);

      expect(mockGetStudentByIdService.execute).toHaveBeenCalledWith(id, {
        id: mockUser.id,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateStudentUseCase with dto', async () => {
      const dto: CreateStudentDto = {
        identifier: 'siswa001',
        password: 'P@ssw0rd!',
        name: 'Ahmad Fauzi',
        nik: '3578010101080001',
        gender: UserGender.MALE,
        birthPlace: 'Malang',
        birthDate: '2008-01-01',
        gradeId: 'GRADE_7',
        nis: '2024001',
        nisn: '0012345678',
      };
      const expected = { id: 'stu-new', nis: '2024001' };
      mockCreateStudentService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto, mockUser);

      expect(mockCreateStudentService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('bulkImport', () => {
    it('should delegate buffer to BulkImportStudentsUseCase and return result', async () => {
      const fakeFile = {
        buffer: Buffer.from('fake-excel'),
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        originalname: 'students.xlsx',
      } as Express.Multer.File;

      const expected = {
        total: 2,
        success: 2,
        failed: 0,
        results: [
          { row: 2, status: 'SUCCESS', identifier: 'siswa001' },
          { row: 3, status: 'SUCCESS', identifier: 'siswa002' },
        ],
      };
      mockBulkImportStudentsService.execute.mockResolvedValue(expected);

      const result = await controller.bulkImport(fakeFile, mockUser);

      expect(mockBulkImportStudentsService.execute).toHaveBeenCalledWith(
        fakeFile.buffer,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('export', () => {
    it('should return a StreamableFile wrapping the buffer from ExportStudentsUseCase', async () => {
      const fakeBuffer = Buffer.from('PK-fake-xlsx');
      mockExportStudentsService.execute.mockResolvedValue(fakeBuffer);

      const query: ExportStudentQueryDto = { search: 'Ahmad' };
      const result = await controller.export(mockUser, query);

      expect(mockExportStudentsService.execute).toHaveBeenCalledWith(query);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should delegate to UpdateStudentUseCase with id and dto', async () => {
      const id = 'stu-1';
      const dto: UpdateStudentDto = { nis: '2024002' };
      const expected = { id: 'stu-1', nis: '2024002' };
      mockUpdateStudentService.execute.mockResolvedValue(expected);

      const result = await controller.update(mockUser, id, dto);

      expect(mockUpdateStudentService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteStudentUseCase with id', async () => {
      const id = 'stu-1';
      mockDeleteStudentService.execute.mockResolvedValue(undefined);

      await controller.remove(mockUser, id);

      expect(mockDeleteStudentService.execute).toHaveBeenCalledWith(id);
    });
  });
});
