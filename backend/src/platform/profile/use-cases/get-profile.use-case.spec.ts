import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { GetProfileUseCase } from './get-profile.use-case.js';

describe('GetProfileUseCase', () => {
  let service: GetProfileUseCase;

  const mockRepo = {
    findDetailByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileUseCase,
        { provide: ProfileRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<GetProfileUseCase>(GetProfileUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';

    it('should return user data with all relations when profile exists', async () => {
      const mockUser = {
        id: 'user-1',
        role: 'STUDENT',
        profile: { id: 'prof-1', name: 'Ahmad Fauzi' },
        student: { id: 'stu-1', nis: '12345' },
        teacher: null,
      };
      mockRepo.findDetailByUserId.mockResolvedValue(mockUser);

      const result = await service.execute(userId);

      expect(mockRepo.findDetailByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepo.findDetailByUserId.mockResolvedValue(null);

      await expect(service.execute(userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user exists but has no profile', async () => {
      mockRepo.findDetailByUserId.mockResolvedValue({
        id: 'user-1',
        role: 'STUDENT',
        profile: null,
      });

      await expect(service.execute(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
