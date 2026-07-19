import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { GetProfileUseCase } from './get-profile.use-case.js';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;

  const mockAuthRepository = {
    findUserById: jest.fn(),
  };

  const mockUser = {
    id: 'user-uuid-1',
    identifier: 'admin',
    isActive: true,
    profile: { name: 'Admin User' },
    userRoles: [{ role: { code: 'ADMIN' } }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileUseCase,
        { provide: IAuthRepository, useValue: mockAuthRepository },
      ],
    }).compile();

    useCase = module.get<GetProfileUseCase>(GetProfileUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user profile data', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(mockUser);

      const result = await useCase.execute('user-uuid-1');

      expect(result).toEqual({
        id: mockUser.id,
        identifier: mockUser.identifier,
        isActive: mockUser.isActive,
        name: 'Admin User',
        roles: ['ADMIN'],
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockAuthRepository.findUserById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
