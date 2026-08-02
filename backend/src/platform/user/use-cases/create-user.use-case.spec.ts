import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../dto/request/create-user.dto.js';
import { IUserRepository } from '../domain/interfaces/user-repository.interface.js';
import { CreateUserUseCase } from './create-user.use-case.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

jest.mock('../../../shared/utils/hash.helper.js', () => ({
  hashPassword: jest.fn(),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  const mockRepo = {
    existsByIdentifier: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: IUserRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateUserDto = {
      identifier: 'newuser',
      password: 'pass123',
    };

    it('should create a user successfully', async () => {
      const created = {
        id: 'user-1',
        identifier: 'newuser',
      };
      mockRepo.existsByIdentifier.mockResolvedValue(false);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-pass');
      mockRepo.create.mockResolvedValue(created);

      const result = await useCase.execute(dto);

      expect(mockRepo.existsByIdentifier).toHaveBeenCalledWith(dto.identifier);
      expect(hashPassword).toHaveBeenCalledWith(dto.password);
      expect(mockRepo.create).toHaveBeenCalledWith({
        identifier: dto.identifier,
        passwordHash: 'hashed-pass',
      });
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when username is already taken', async () => {
      mockRepo.existsByIdentifier.mockResolvedValue(true);

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
