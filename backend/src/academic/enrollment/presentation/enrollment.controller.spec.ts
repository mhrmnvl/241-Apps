import { Test, TestingModule } from '@nestjs/testing';
import { BulkCreateStudentEnrollmentDto } from '../dto/request/bulk-create-student-enrollment.dto.js';
import { CreateStudentEnrollmentDto } from '../dto/request/create-student-enrollment.dto.js';
import { StudentEnrollmentQueryDto } from '../dto/request/student-enrollment-query.dto.js';
import { UpdateStudentEnrollmentDto } from '../dto/request/update-student-enrollment.dto.js';
import { TransferStudentDto } from '../dto/request/transfer-student.dto.js';
import { DropStudentDto } from '../dto/request/drop-student.dto.js';
import { BulkCreateStudentEnrollmentUseCase } from '../use-cases/bulk-create-student-enrollment.use-case.js';
import { BulkTransferStudentUseCase } from '../use-cases/bulk-transfer-student.use-case.js';
import { CreateStudentEnrollmentUseCase } from '../use-cases/create-student-enrollment.use-case.js';
import { DeleteStudentEnrollmentUseCase } from '../use-cases/delete-student-enrollment.use-case.js';
import { DropStudentUseCase } from '../use-cases/drop-student.use-case.js';
import { GetStudentEnrollmentByIdUseCase } from '../use-cases/get-student-enrollment-by-id.use-case.js';
import { GetStudentEnrollmentsUseCase } from '../use-cases/get-student-enrollments.use-case.js';
import { TransferStudentUseCase } from '../use-cases/transfer-student.use-case.js';
import { UpdateStudentEnrollmentUseCase } from '../use-cases/update-student-enrollment.use-case.js';
import { EnrollmentController } from './enrollment.controller.js';

describe('EnrollmentController', () => {
  let controller: EnrollmentController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockBulkCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };
  const mockTransfer = { execute: jest.fn() };
  const mockBulkTransfer = { execute: jest.fn() };
  const mockDrop = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [
        { provide: GetStudentEnrollmentsUseCase, useValue: mockGetAll },
        { provide: GetStudentEnrollmentByIdUseCase, useValue: mockGetById },
        { provide: CreateStudentEnrollmentUseCase, useValue: mockCreate },
        {
          provide: BulkCreateStudentEnrollmentUseCase,
          useValue: mockBulkCreate,
        },
        { provide: UpdateStudentEnrollmentUseCase, useValue: mockUpdate },
        { provide: DeleteStudentEnrollmentUseCase, useValue: mockDelete },
        { provide: TransferStudentUseCase, useValue: mockTransfer },
        { provide: BulkTransferStudentUseCase, useValue: mockBulkTransfer },
        { provide: DropStudentUseCase, useValue: mockDrop },
      ],
    }).compile();

    controller = module.get<EnrollmentController>(EnrollmentController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetStudentEnrollmentsUseCase', async () => {
      const query: StudentEnrollmentQueryDto = { page: 1, limit: 10 };
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(query);
      expect(mockGetAll.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetStudentEnrollmentByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'se-1' });
      const result = await controller.findOne('se-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('se-1');
      expect(result).toEqual({ id: 'se-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateStudentEnrollmentUseCase', async () => {
      const dto: CreateStudentEnrollmentDto = {
        studentId: 'stu-1',
        classroomId: 'cls-1',
        semesterId: 'sem-1',
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('bulkCreate', () => {
    it('should delegate to BulkCreateStudentEnrollmentUseCase', async () => {
      const dto: BulkCreateStudentEnrollmentDto = {
        enrollments: [
          {
            studentId: 'stu-1',
            classroomId: 'cls-1',
            semesterId: 'sem-1',
          },
        ],
      };
      mockBulkCreate.execute.mockResolvedValue({ created: 1 });
      await controller.bulkCreate(dto);
      expect(mockBulkCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateStudentEnrollmentUseCase', async () => {
      const dto: UpdateStudentEnrollmentDto = { classroomId: 'cls-2' };
      mockUpdate.execute.mockResolvedValue({ id: 'se-1' });
      await controller.update('se-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('se-1', dto);
    });
  });

  describe('transfer', () => {
    it('should delegate to TransferStudentUseCase', async () => {
      const dto: TransferStudentDto = { targetClassroomId: 'cls-new' };
      mockTransfer.execute.mockResolvedValue({ id: 'se-1' });
      await controller.transfer('se-1', dto);
      expect(mockTransfer.execute).toHaveBeenCalledWith('se-1', dto);
    });
  });

  describe('drop', () => {
    it('should delegate to DropStudentUseCase', async () => {
      const dto: DropStudentDto = { note: 'Dropped out' };
      mockDrop.execute.mockResolvedValue({ id: 'se-1' });
      await controller.drop('se-1', dto);
      expect(mockDrop.execute).toHaveBeenCalledWith('se-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteStudentEnrollmentUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('se-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('se-1');
    });
  });
});
