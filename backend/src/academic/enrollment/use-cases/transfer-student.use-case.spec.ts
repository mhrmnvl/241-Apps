import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentStatus } from '../../../shared/domain/enums/enrollment-status.enum.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { TransferStudentUseCase } from './transfer-student.use-case.js';

describe('TransferStudentUseCase', () => {
  let useCase: TransferStudentUseCase;

  const mockRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferStudentUseCase,
        { provide: IEnrollmentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<TransferStudentUseCase>(TransferStudentUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when enrollment not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(
        useCase.execute('enr-1', { targetClassroomId: 'cls-2' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when enrollment is not ACTIVE', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.DROPPED,
      });
      await expect(
        useCase.execute('enr-1', { targetClassroomId: 'cls-2' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transfer student to new class', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.ACTIVE,
      });
      mockRepo.update.mockResolvedValue({ id: 'enr-1', classroomId: 'cls-2' });

      const result = await useCase.execute('enr-1', {
        targetClassroomId: 'cls-2',
        note: 'Class change',
      });

      expect(mockRepo.update).toHaveBeenCalledWith('enr-1', {
        classroomId: 'cls-2',
        note: 'Class change',
      });
      expect(result.classroomId).toBe('cls-2');
    });
  });
});
