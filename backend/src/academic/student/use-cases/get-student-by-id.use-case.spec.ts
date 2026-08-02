import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import type { RequestUser } from '../types/student.types.js';
import { GetStudentByIdUseCase } from './get-student-by-id.use-case.js';

describe('GetStudentByIdUseCase', () => {
  let useCase: GetStudentByIdUseCase;

  const mockRepo = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    isStudent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStudentByIdUseCase,
        { provide: IStudentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetStudentByIdUseCase>(GetStudentByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'stu-1';
    const mockStudent = { id: 'stu-1', nis: '2024001' };

    it('should return student for ADMIN without ownership check', async () => {
      const requester: RequestUser = {
        id: 'admin-1',
      };
      mockRepo.isStudent.mockResolvedValue(false);
      mockRepo.findById.mockResolvedValue(mockStudent);

      const result = await useCase.execute(id, requester);

      expect(mockRepo.findByUserId).not.toHaveBeenCalled();
      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockStudent);
    });

    it('should return student for STUDENT role when accessing own data', async () => {
      const requester: RequestUser = {
        id: 'user-1',
      };
      mockRepo.isStudent.mockResolvedValue(true);
      mockRepo.findByUserId.mockResolvedValue({ id: 'stu-1' });
      mockRepo.findById.mockResolvedValue(mockStudent);

      const result = await useCase.execute(id, requester);

      expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockStudent);
    });

    it('should throw ForbiddenException when STUDENT account is not linked', async () => {
      const requester: RequestUser = {
        id: 'user-orphan',
      };
      mockRepo.isStudent.mockResolvedValue(true);
      mockRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(id, requester)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepo.findById).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when STUDENT accesses another student data', async () => {
      const requester: RequestUser = {
        id: 'user-1',
      };
      mockRepo.isStudent.mockResolvedValue(true);
      mockRepo.findByUserId.mockResolvedValue({ id: 'stu-other' });

      await expect(useCase.execute(id, requester)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepo.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when student is not found', async () => {
      const requester: RequestUser = {
        id: 'admin-1',
      };
      mockRepo.isStudent.mockResolvedValue(false);
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, requester)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return student when called without requester (no auth guard context)', async () => {
      mockRepo.findById.mockResolvedValue(mockStudent);

      const result = await useCase.execute(id);

      expect(mockRepo.findByUserId).not.toHaveBeenCalled();
      expect(result).toEqual(mockStudent);
    });
  });
});
