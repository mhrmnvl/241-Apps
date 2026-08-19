import { Test, TestingModule } from '@nestjs/testing';
import { CreateStudentGraduationDto } from '../dto/request/create-student-graduation.dto.js';
import { StudentGraduationQueryDto } from '../dto/request/student-graduation-query.dto.js';
import { UpdateStudentGraduationDto } from '../dto/request/update-student-graduation.dto.js';
import { CreateStudentGraduationUseCase } from '../use-cases/create-student-graduation.use-case.js';
import { DeleteStudentGraduationUseCase } from '../use-cases/delete-student-graduation.use-case.js';
import { GetGraduationCandidatesUseCase } from '../use-cases/get-graduation-candidates.use-case.js';
import { BulkGraduateStudentsUseCase } from '../use-cases/bulk-graduate-students.use-case.js';
import { GetStudentGraduationByIdUseCase } from '../use-cases/get-student-graduation-by-id.use-case.js';
import { GetStudentGraduationsUseCase } from '../use-cases/get-student-graduations.use-case.js';
import { UpdateStudentGraduationUseCase } from '../use-cases/update-student-graduation.use-case.js';
import { GraduationController } from './graduation.controller.js';

describe('GraduationController', () => {
  let controller: GraduationController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };
  const mockCandidates = { execute: jest.fn() };
  const mockBulk = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraduationController],
      providers: [
        { provide: GetStudentGraduationsUseCase, useValue: mockGetAll },
        { provide: GetStudentGraduationByIdUseCase, useValue: mockGetById },
        { provide: CreateStudentGraduationUseCase, useValue: mockCreate },
        { provide: UpdateStudentGraduationUseCase, useValue: mockUpdate },
        { provide: DeleteStudentGraduationUseCase, useValue: mockDelete },
        { provide: GetGraduationCandidatesUseCase, useValue: mockCandidates },
        { provide: BulkGraduateStudentsUseCase, useValue: mockBulk },
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
      const result = await controller.findAll(query);
      expect(mockGetAll.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetStudentGraduationByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'grad-1' });
      const result = await controller.findOne('grad-1');
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
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateStudentGraduationUseCase', async () => {
      const dto: UpdateStudentGraduationDto = { certificateNo: 'DN-01' };
      mockUpdate.execute.mockResolvedValue({ id: 'grad-1' });
      await controller.update('grad-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('grad-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteStudentGraduationUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('grad-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('grad-1');
    });
  });
});
