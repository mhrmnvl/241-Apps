import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentStatus } from '../../../shared/domain/enums/enrollment-status.enum.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { ClassroomCapacityService } from '../services/classroom-capacity.service.js';
import { TransferStudentUseCase } from './transfer-student.use-case.js';

describe('TransferStudentUseCase', () => {
  let useCase: TransferStudentUseCase;

  const mockRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockCapacity = { assertRoomFor: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferStudentUseCase,
        { provide: IEnrollmentRepository, useValue: mockRepo },
        { provide: ClassroomCapacityService, useValue: mockCapacity },
      ],
    }).compile();

    useCase = module.get<TransferStudentUseCase>(TransferStudentUseCase);
    jest.clearAllMocks();
    // clearAllMocks forgets the calls but keeps the implementation, so a
    // rejection set by one test would otherwise fail the next one.
    mockCapacity.assertRoomFor.mockResolvedValue(undefined);
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
        classroomId: 'cls-1',
        semesterId: 'sem-1',
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

    /**
     * The destination has to have room, and until this was added no transfer
     * path checked — only enrolling a new student did. A class could be filled
     * past its capacity by moving people into it.
     */
    it('asks whether the destination has room, before moving anyone', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.ACTIVE,
        classroomId: 'cls-1',
        semesterId: 'sem-1',
      });
      mockCapacity.assertRoomFor.mockRejectedValue(
        new BadRequestException('full'),
      );

      await expect(
        useCase.execute('enr-1', { targetClassroomId: 'cls-2' }),
      ).rejects.toThrow(BadRequestException);

      expect(mockCapacity.assertRoomFor).toHaveBeenCalledWith({
        classroomId: 'cls-2',
        semesterId: 'sem-1',
        incoming: 1,
      });
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    /**
     * Transferring someone to the classroom they are already in adds nobody, so
     * a full classroom must not refuse it — it is full *of them*.
     */
    it('counts nobody as arriving when the target is the current classroom', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'enr-1',
        status: EnrollmentStatus.ACTIVE,
        classroomId: 'cls-2',
        semesterId: 'sem-1',
      });
      mockRepo.update.mockResolvedValue({ id: 'enr-1', classroomId: 'cls-2' });

      await useCase.execute('enr-1', { targetClassroomId: 'cls-2' });

      expect(mockCapacity.assertRoomFor).toHaveBeenCalledWith({
        classroomId: 'cls-2',
        semesterId: 'sem-1',
        incoming: 0,
      });
    });
  });
});
