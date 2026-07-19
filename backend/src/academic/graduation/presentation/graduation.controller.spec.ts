import { Test, TestingModule } from '@nestjs/testing';
import { CreateStudentGraduationDto } from '../dto/create-student-graduation.dto.js';
import { StudentGraduationQueryDto } from '../dto/student-graduation-query.dto.js';
import { UpdateStudentGraduationDto } from '../dto/update-student-graduation.dto.js';
import { CreateStudentGraduationUseCase } from '../use-cases/create-student-graduation.use-case.js';
import { DeleteStudentGraduationUseCase } from '../use-cases/delete-student-graduation.use-case.js';
import { GetStudentGraduationByIdUseCase } from '../use-cases/get-student-graduation-by-id.use-case.js';
import { GetStudentGraduationsUseCase } from '../use-cases/get-student-graduations.use-case.js';
import { UpdateStudentGraduationUseCase } from '../use-cases/update-student-graduation.use-case.js';
import { GraduationController } from './graduation.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('GraduationController', () => {
  let controller: GraduationController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  const mockUser: AuthenticatedUser = {
    id: 'usr-1',
    sub: 'usr-1',
    identifier: 'admin',
    sessionId: 'sess-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraduationController],
      providers: [
        { provide: GetStudentGraduationsUseCase, useValue: mockGetAll },
        { provide: GetStudentGraduationByIdUseCase, useValue: mockGetById },
        { provide: CreateStudentGraduationUseCase, useValue: mockCreate },
        { provide: UpdateStudentGraduationUseCase, useValue: mockUpdate },
        { provide: DeleteStudentGraduationUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<GraduationController>(GraduationController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetStudentGraduationsUseCase', async () => {
      const query: StudentGraduationQueryDto = { page: 1, limit: 10 };
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(mockUser, query);
      expect(mockGetAll.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetStudentGraduationByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'grad-1' });
      const result = await controller.findOne(mockUser, 'grad-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('grad-1');
      expect(result).toEqual({ id: 'grad-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateStudentGraduationUseCase', async () => {
      const dto: CreateStudentGraduationDto = {
        studentId: 'stu-1',
        academicYearId: 'ay-1',
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(mockUser, dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateStudentGraduationUseCase', async () => {
      const dto: UpdateStudentGraduationDto = { certificateNo: 'DN-01' };
      mockUpdate.execute.mockResolvedValue({ id: 'grad-1' });
      await controller.update(mockUser, 'grad-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('grad-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteStudentGraduationUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'grad-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('grad-1');
    });
  });
});
