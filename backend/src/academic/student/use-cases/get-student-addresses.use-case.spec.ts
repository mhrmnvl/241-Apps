import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IStudentAddressRepository } from '../domain/interfaces/student-address-repository.interface.js';
import { RequestUser, IStudentRepository } from '../index.js';
import { GetStudentAddressesUseCase } from './get-student-addresses.use-case.js';

describe('GetStudentAddressesUseCase', () => {
  let useCase: GetStudentAddressesUseCase;

  const mockRepo = {
    isStudent: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
  };

  const mockAddressRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStudentAddressesUseCase,
        { provide: IStudentRepository, useValue: mockRepo },
        { provide: IStudentAddressRepository, useValue: mockAddressRepository },
      ],
    }).compile();

    useCase = module.get<GetStudentAddressesUseCase>(
      GetStudentAddressesUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const studentId = 'stu-1';
    const addresses = [{ id: 'addr-1', city: 'Malang' }];

    it('should return addresses for ADMIN without ownership check', async () => {
      const requester: RequestUser = {
        id: 'admin-1',
      };
      mockRepo.isStudent.mockResolvedValue(false);
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepository.findAll.mockResolvedValue(addresses);

      const result = await useCase.execute(studentId, requester);

      expect(mockRepo.findByUserId).not.toHaveBeenCalled();
      expect(result).toEqual(addresses);
    });

    it('should return addresses for STUDENT accessing own data', async () => {
      const requester: RequestUser = {
        id: 'user-1',
      };
      mockRepo.isStudent.mockResolvedValue(true);
      mockRepo.findByUserId.mockResolvedValue({ id: 'stu-1' });
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepository.findAll.mockResolvedValue(addresses);

      const result = await useCase.execute(studentId, requester);

      expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(addresses);
    });

    it('should throw ForbiddenException when STUDENT account is not linked', async () => {
      const requester: RequestUser = {
        id: 'user-orphan',
      };
      mockRepo.isStudent.mockResolvedValue(true);
      mockRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(studentId, requester)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when STUDENT accesses another student', async () => {
      const requester: RequestUser = {
        id: 'user-1',
      };
      mockRepo.isStudent.mockResolvedValue(true);
      mockRepo.findByUserId.mockResolvedValue({ id: 'stu-other' });

      await expect(useCase.execute(studentId, requester)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when student is not found', async () => {
      const requester: RequestUser = {
        id: 'admin-1',
      };
      mockRepo.isStudent.mockResolvedValue(false);
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(studentId, requester)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
