import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { PasswordManagerService } from '../services/password-manager.service.js';
import { TokenManagerService } from '../services/token-manager.service.js';
import { LoginUseCase } from './login.use-case.js';
import { LoginDto } from '../dto/login.dto.js';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  const mockPasswordManagerService = {
    validatePassword: jest.fn(),
  };

  const mockTokenManagerService = {
    generateTokenPair: jest.fn(),
    hashToken: jest.fn(),
    getRefreshExpirationMs: jest.fn(),
  };

  const mockAuthRepository = {
    findUserByIdentifier: jest.fn(),
    createSession: jest.fn(),
  };

  const mockUser = {
    id: 'user-uuid-1',
    identifier: 'admin',
    passwordHash: 'hashed-password',
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: PasswordManagerService,
          useValue: mockPasswordManagerService,
        },
        { provide: TokenManagerService, useValue: mockTokenManagerService },
        { provide: IAuthRepository, useValue: mockAuthRepository },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const loginDto: LoginDto = { identifier: 'admin', password: 'password123' };

    it('should login successfully and return tokens with user info', async () => {
      mockAuthRepository.findUserByIdentifier.mockResolvedValue(mockUser);
      mockPasswordManagerService.validatePassword.mockResolvedValue(true);
      mockTokenManagerService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      mockTokenManagerService.hashToken.mockReturnValue('hashed-refresh');
      mockTokenManagerService.getRefreshExpirationMs.mockReturnValue(604800000);
      mockAuthRepository.createSession.mockResolvedValue({});

      const result = await useCase.execute(
        loginDto,
        'Mozilla/5.0',
        '127.0.0.1',
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        refreshExpiresInMs: 604800000,
        user: {
          id: mockUser.id,
          identifier: mockUser.identifier,
          isActive: mockUser.isActive,
          roles: [],
        },
      });
    });

    it('should create a session with correct data', async () => {
      mockAuthRepository.findUserByIdentifier.mockResolvedValue(mockUser);
      mockPasswordManagerService.validatePassword.mockResolvedValue(true);
      mockTokenManagerService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      mockTokenManagerService.hashToken.mockReturnValue('hashed-refresh');
      mockTokenManagerService.getRefreshExpirationMs.mockReturnValue(604800000);
      mockAuthRepository.createSession.mockResolvedValue({});

      await useCase.execute(loginDto, 'Mozilla/5.0', '127.0.0.1');

      expect(mockAuthRepository.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          tokenHash: 'hashed-refresh',
          userAgent: 'Mozilla/5.0',
          ipAddress: '127.0.0.1',
        }),
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockAuthRepository.findUserByIdentifier.mockResolvedValue(null);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(
        mockPasswordManagerService.validatePassword,
      ).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockAuthRepository.findUserByIdentifier.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is soft-deleted', async () => {
      mockAuthRepository.findUserByIdentifier.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockAuthRepository.findUserByIdentifier.mockResolvedValue(mockUser);
      mockPasswordManagerService.validatePassword.mockResolvedValue(false);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockTokenManagerService.generateTokenPair).not.toHaveBeenCalled();
    });

    it('should work without optional userAgent and ipAddress', async () => {
      mockAuthRepository.findUserByIdentifier.mockResolvedValue(mockUser);
      mockPasswordManagerService.validatePassword.mockResolvedValue(true);
      mockTokenManagerService.generateTokenPair.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      mockTokenManagerService.hashToken.mockReturnValue('hashed-refresh');
      mockTokenManagerService.getRefreshExpirationMs.mockReturnValue(604800000);
      mockAuthRepository.createSession.mockResolvedValue({});

      const result = await useCase.execute(loginDto);

      expect(result.accessToken).toBeDefined();
      expect(mockAuthRepository.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: undefined,
          ipAddress: undefined,
        }),
      );
    });
  });
});
