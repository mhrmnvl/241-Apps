import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '../domain/interfaces/user-repository.interface.js';
import { DeleteUserUseCase } from './delete-user.use-case.js';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;

  const mockRepo = {
    existsById: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        { provide: IUserRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete user successfully', async () => {
      mockRepo.existsById.mockResolvedValue(true);
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute('user-1');

      expect(mockRepo.existsById).toHaveBeenCalledWith('user-1');
      expect(mockRepo.remove).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockRepo.existsById.mockResolvedValue(false);

      await expect(useCase.execute('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
