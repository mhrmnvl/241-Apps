import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../domain/interfaces/user-repository.interface.js';
import { GetUserByIdUseCase } from './get-user-by-id.use-case.js';

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;

  const mockRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        { provide: IUserRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user when found', async () => {
      const user = { id: 'user-1', username: 'admin' };
      mockRepo.findById.mockResolvedValue(user);

      const result = await useCase.execute('user-1');

      expect(mockRepo.findById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
