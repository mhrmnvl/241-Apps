import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { SemesterRepository } from '../../semester/repositories/semester.repository.js';
import { CreateStudentEnrollmentUseCase } from './create-student-enrollment.use-case.js';
import { TransferStudentUseCase } from './transfer-student.use-case.js';
import { EnsureStudentEnrollmentUseCase } from './ensure-student-enrollment.use-case.js';

describe('EnsureStudentEnrollmentUseCase', () => {
  let useCase: EnsureStudentEnrollmentUseCase;

  const mockEnrollmentRepo = {
    findDuplicate: jest.fn(),
  };

  const mockSemesterRepo = {
    findActive: jest.fn(),
  };

  const mockCreateStudentEnrollment = {
    execute: jest.fn(),
  };

  const mockTransferStudent = {
    execute: jest.fn(),
  };

  const activeSemester = { id: 'sem-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnsureStudentEnrollmentUseCase,
        { provide: IEnrollmentRepository, useValue: mockEnrollmentRepo },
        { provide: SemesterRepository, useValue: mockSemesterRepo },
        {
          provide: CreateStudentEnrollmentUseCase,
          useValue: mockCreateStudentEnrollment,
        },
        { provide: TransferStudentUseCase, useValue: mockTransferStudent },
      ],
    }).compile();

    useCase = module.get<EnsureStudentEnrollmentUseCase>(
      EnsureStudentEnrollmentUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('does nothing when there is no active semester', async () => {
      mockSemesterRepo.findActive.mockResolvedValue(null);

      await useCase.execute('stu-1', 'cls-1');

      expect(mockEnrollmentRepo.findDuplicate).not.toHaveBeenCalled();
      expect(mockCreateStudentEnrollment.execute).not.toHaveBeenCalled();
      expect(mockTransferStudent.execute).not.toHaveBeenCalled();
    });

    it('creates a new enrollment when the student has none this semester', async () => {
      mockSemesterRepo.findActive.mockResolvedValue(activeSemester);
      mockEnrollmentRepo.findDuplicate.mockResolvedValue(null);

      await useCase.execute('stu-1', 'cls-1');

      expect(mockCreateStudentEnrollment.execute).toHaveBeenCalledWith({
        studentId: 'stu-1',
        classroomId: 'cls-1',
        semesterId: 'sem-1',
      });
      expect(mockTransferStudent.execute).not.toHaveBeenCalled();
    });

    it('does nothing when already enrolled in the same classroom', async () => {
      mockSemesterRepo.findActive.mockResolvedValue(activeSemester);
      mockEnrollmentRepo.findDuplicate.mockResolvedValue({
        id: 'enr-1',
        classroomId: 'cls-1',
      });

      await useCase.execute('stu-1', 'cls-1');

      expect(mockCreateStudentEnrollment.execute).not.toHaveBeenCalled();
      expect(mockTransferStudent.execute).not.toHaveBeenCalled();
    });

    it('transfers to the new classroom when already enrolled elsewhere', async () => {
      mockSemesterRepo.findActive.mockResolvedValue(activeSemester);
      mockEnrollmentRepo.findDuplicate.mockResolvedValue({
        id: 'enr-1',
        classroomId: 'cls-old',
      });

      await useCase.execute('stu-1', 'cls-new');

      expect(mockTransferStudent.execute).toHaveBeenCalledWith('enr-1', {
        targetClassroomId: 'cls-new',
      });
      expect(mockCreateStudentEnrollment.execute).not.toHaveBeenCalled();
    });

    it('propagates errors from the transfer instead of swallowing them', async () => {
      mockSemesterRepo.findActive.mockResolvedValue(activeSemester);
      mockEnrollmentRepo.findDuplicate.mockResolvedValue({
        id: 'enr-1',
        classroomId: 'cls-old',
      });
      mockTransferStudent.execute.mockRejectedValue(
        new BadRequestException(
          'Cannot transfer: enrollment status is DROPPED',
        ),
      );

      await expect(useCase.execute('stu-1', 'cls-new')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('propagates errors from creating the enrollment instead of swallowing them', async () => {
      mockSemesterRepo.findActive.mockResolvedValue(activeSemester);
      mockEnrollmentRepo.findDuplicate.mockResolvedValue(null);
      mockCreateStudentEnrollment.execute.mockRejectedValue(
        new Error('unexpected failure'),
      );

      await expect(useCase.execute('stu-1', 'cls-1')).rejects.toThrow(
        'unexpected failure',
      );
    });
  });
});
