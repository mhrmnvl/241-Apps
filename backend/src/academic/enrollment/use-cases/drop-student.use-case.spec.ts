import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentStatus } from '@prisma/client';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { IStudentRepository } from '../../student/domain/interfaces/student-repository.interface.js';
import { DropStudentUseCase } from './drop-student.use-case.js';

describe('DropStudentUseCase', () => {
  let useCase: DropStudentUseCase;

  const mockRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockStudentRepo = {
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DropStudentUseCase,
        { provide: IEnrollmentRepository, useValue: mockRepo },
        { provide: IStudentRepository, useValue: mockStudentRepo },
      ],
    }).compile();

    useCase = module.get<DropStudentUseCase>(DropStudentUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when enrollment not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(useCase.execute('enr-1', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when enrollment is not ACTIVE', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.PROMOTED,
      });
      await expect(useCase.execute('enr-1', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should drop enrollment successfully', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.ACTIVE,
      });
      mockRepo.update.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.DROPPED,
      });

      const result = await useCase.execute('enr-1', {
        note: 'Left school',
      });

      expect(mockRepo.update).toHaveBeenCalledWith('enr-1', {
        status: EnrollmentStatus.DROPPED,
        endedAt: expect.any(Date) as Date,
        note: 'Left school',
      });
      expect(result.status).toBe(EnrollmentStatus.DROPPED);
    });

    it('should drop without note', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.ACTIVE,
      });
      mockRepo.update.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.DROPPED,
      });

      await useCase.execute('enr-1', {});

      expect(mockRepo.update).toHaveBeenCalledWith('enr-1', {
        status: EnrollmentStatus.DROPPED,
        endedAt: expect.any(Date) as Date,
      });
    });
  });
});
