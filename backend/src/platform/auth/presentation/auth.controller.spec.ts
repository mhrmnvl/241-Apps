import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { GetProfileUseCase } from '../use-cases/get-profile.use-case.js';
import { LoginUseCase } from '../use-cases/login.use-case.js';
import { LogoutUseCase } from '../use-cases/logout.use-case.js';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case.js';
import { ChangePasswordUseCase } from '../use-cases/change-password.use-case.js';
import { RequestPasswordResetUseCase } from '../use-cases/request-password-reset.use-case.js';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case.js';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  let controller: AuthController;

  const mockLoginService = { execute: jest.fn() };
  const mockRefreshTokenService = { execute: jest.fn() };
  const mockLogoutService = { execute: jest.fn() };
  const mockGetProfileService = { execute: jest.fn() };
  const mockChangePasswordService = { execute: jest.fn() };
  const mockRequestPasswordResetService = { execute: jest.fn() };
  const mockResetPasswordService = { execute: jest.fn() };
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') return 'test';
      return undefined;
    }),
  };

  const createMockRequest = (
    overrides: Partial<Request> = {},
  ): Partial<Request> => ({
    headers: { 'user-agent': 'jest-test-agent' },
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' } as Request['socket'],
    cookies: {},
    ...overrides,
  });

  const createMockResponse = (): Partial<Response> => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: mockLoginService },
        { provide: RefreshTokenUseCase, useValue: mockRefreshTokenService },
        { provide: LogoutUseCase, useValue: mockLogoutService },
        { provide: GetProfileUseCase, useValue: mockGetProfileService },
        { provide: ChangePasswordUseCase, useValue: mockChangePasswordService },
        {
          provide: RequestPasswordResetUseCase,
          useValue: mockRequestPasswordResetService,
        },
        { provide: ResetPasswordUseCase, useValue: mockResetPasswordService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { identifier: 'admin', password: 'password123' };

    it('should return accessToken and user, set refresh cookie', async () => {
      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        refreshExpiresInMs: 604800000,
        user: {
          id: '1',
          identifier: 'admin',
          isActive: true,
        },
      };
      mockLoginService.execute.mockResolvedValue(loginResult);

      const req = createMockRequest();
      const res = createMockResponse();

      const result = await controller.login(
        loginDto,
        req as Request,
        res as Response,
      );

      expect(result).toEqual({
        accessToken: 'access-token',
        user: loginResult.user,
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/auth',
        }),
      );
    });

    it('should pass userAgent and ipAddress to use case', async () => {
      mockLoginService.execute.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        refreshExpiresInMs: 604800000,
        user: {},
      });

      const req = createMockRequest();
      const res = createMockResponse();

      await controller.login(loginDto, req as Request, res as Response);

      expect(mockLoginService.execute).toHaveBeenCalledWith(
        loginDto,
        'jest-test-agent',
        '127.0.0.1',
      );
    });
  });

  describe('refresh', () => {
    it('should rotate tokens from cookie', async () => {
      const refreshResult = {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        refreshExpiresInMs: 604800000,
        user: { id: '1', username: 'admin', role: 'ADMIN', isActive: true },
      };
      mockRefreshTokenService.execute.mockResolvedValue(refreshResult);

      const req = createMockRequest({
        cookies: { refresh_token: 'old-refresh' },
      });
      const res = createMockResponse();

      const result = await controller.refresh(req as Request, res as Response);

      expect(result).toEqual({
        accessToken: 'new-access',
        user: refreshResult.user,
      });
      expect(res.cookie).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no refresh cookie', async () => {
      const req = createMockRequest({ cookies: {} });
      const res = createMockResponse();

      await expect(
        controller.refresh(req as Request, res as Response),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke session and clear cookie', async () => {
      mockLogoutService.execute.mockResolvedValue(undefined);
      const res = createMockResponse();
      const user = { sessionId: 'session-uuid-1' } as any;

      const result = await controller.logout(user, res as Response);

      expect(mockLogoutService.execute).toHaveBeenCalledWith('session-uuid-1');
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/auth',
        }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      const profile = {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
        isActive: true,
      };
      mockGetProfileService.execute.mockResolvedValue(profile);

      const result = await controller.getMe({ id: '1' } as any);

      expect(result).toEqual(profile);
      expect(mockGetProfileService.execute).toHaveBeenCalledWith('1');
    });
  });
});
