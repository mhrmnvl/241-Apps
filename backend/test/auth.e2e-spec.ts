import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import * as crypto from 'node:crypto';
import type { Server } from 'node:http';
import request from 'supertest';
import { PrismaModule } from '../src/core/database/prisma.module.js';
import { PrismaService } from '../src/core/database/prisma.service.js';
import { ResponseInterceptor } from '../src/core/interceptors/response.interceptor.js';
import { AuthModule } from '../src/platform/auth/auth.module.js';

const TEST_JWT_SECRET = 'test-jwt-secret-for-e2e-testing-minimum-32-chars';

interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
}

interface AuthData {
  accessToken: string;
  user: { id: string; username: string; role: string; isActive: boolean };
}

interface LogoutData {
  message: string;
}

interface ProfileData {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
}

function getCookies(res: request.Response): string[] {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let jwtService: JwtService;
  let hashedPassword: string;

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    authSession: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const TEST_USER_ID = 'b3d7f1a0-1234-4abc-9def-000000000001';
  const TEST_SESSION_ID = 'b3d7f1a0-1234-4abc-9def-000000000002';

  function buildMockUser(overrides: Record<string, unknown> = {}) {
    return {
      id: TEST_USER_ID,
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  function buildMockSession(
    sessionId: string,
    overrides: Record<string, unknown> = {},
  ) {
    return {
      id: sessionId,
      userId: TEST_USER_ID,
      tokenHash: 'any-hash',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 86400000),
      user: {
        id: TEST_USER_ID,
        username: 'admin',
        role: 'ADMIN',
        isActive: true,
        deletedAt: null,
      },
      ...overrides,
    };
  }

  function generateAccessToken(sessionId: string) {
    return jwtService.sign(
      {
        sub: TEST_USER_ID,
        sessionId,
        username: 'admin',
        role: 'ADMIN',
        type: 'access',
      },
      { secret: TEST_JWT_SECRET, expiresIn: '15m' },
    );
  }

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash('password123', 10);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              NODE_ENV: 'test',
              JWT_SECRET: TEST_JWT_SECRET,
              JWT_ACCESS_EXPIRATION: '15m',
              JWT_REFRESH_EXPIRATION: '7d',
              DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
            }),
          ],
        }),
        PrismaModule,
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    httpServer = app.getHttpServer() as Server;
    jwtService = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return 200 with accessToken and set refresh_token cookie', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(buildMockUser());
      mockPrismaService.authSession.create.mockResolvedValue({});

      const res = await request(httpServer)
        .post('/auth/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(200);

      const body = res.body as ApiResponse<AuthData>;
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.user).toEqual(
        expect.objectContaining({
          id: TEST_USER_ID,
          username: 'admin',
          role: 'ADMIN',
          isActive: true,
        }),
      );

      const cookies = getCookies(res);
      expect(cookies.length).toBeGreaterThan(0);
      expect(cookies.some((c) => c.startsWith('refresh_token='))).toBe(true);
    });

    it('should return 401 for wrong password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(buildMockUser());

      await request(httpServer)
        .post('/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await request(httpServer)
        .post('/auth/login')
        .send({ username: 'ghost', password: 'password123' })
        .expect(401);
    });

    it('should return 401 for inactive user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        buildMockUser({ isActive: false }),
      );

      await request(httpServer)
        .post('/auth/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(401);
    });

    it('should return 401 for soft-deleted user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        buildMockUser({ deletedAt: new Date() }),
      );

      await request(httpServer)
        .post('/auth/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(401);
    });

    it('should return 400 when body is empty', async () => {
      await request(httpServer).post('/auth/login').send({}).expect(400);
    });

    it('should return 400 when username is missing', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({ password: 'password123' })
        .expect(400);
    });

    it('should return 400 when password is missing', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({ username: 'admin' })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 200 and rotate tokens when refresh cookie is valid', async () => {
      const refreshToken = jwtService.sign(
        {
          sub: TEST_USER_ID,
          sessionId: TEST_SESSION_ID,
          username: 'admin',
          role: 'ADMIN',
          type: 'refresh',
        },
        { secret: TEST_JWT_SECRET, expiresIn: '7d' },
      );

      const tokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      mockPrismaService.authSession.findUnique.mockResolvedValue(
        buildMockSession(TEST_SESSION_ID, { tokenHash }),
      );
      mockPrismaService.authSession.update.mockResolvedValue({});

      const res = await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshToken}`])
        .expect(200);

      const body = res.body as ApiResponse<AuthData>;
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.user).toBeDefined();

      const cookies = getCookies(res);
      expect(cookies.some((c) => c.startsWith('refresh_token='))).toBe(true);
    });

    it('should return 401 when no refresh cookie is present', async () => {
      await request(httpServer).post('/auth/refresh').expect(401);
    });

    it('should return 401 when refresh token is invalid', async () => {
      await request(httpServer)
        .post('/auth/refresh')
        .set('Cookie', ['refresh_token=invalid-token'])
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 200 and clear refresh cookie', async () => {
      mockPrismaService.authSession.findUnique.mockResolvedValue(
        buildMockSession(TEST_SESSION_ID),
      );
      mockPrismaService.authSession.update.mockResolvedValue({});

      const token = generateAccessToken(TEST_SESSION_ID);

      const res = await request(httpServer)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as ApiResponse<LogoutData>;
      expect(body.data.message).toBe('Logged out successfully');

      const cookies = getCookies(res);
      expect(cookies.length).toBeGreaterThan(0);
      expect(
        cookies.some(
          (c) => c.startsWith('refresh_token=') && c.includes('Expires='),
        ),
      ).toBe(true);
    });

    it('should return 401 without bearer token', async () => {
      await request(httpServer).post('/auth/logout').expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 200 with user profile', async () => {
      mockPrismaService.authSession.findUnique.mockResolvedValue(
        buildMockSession(TEST_SESSION_ID),
      );
      mockPrismaService.user.findUnique.mockResolvedValue(
        buildMockUser({ profile: { fullName: 'Admin User' } }),
      );

      const token = generateAccessToken(TEST_SESSION_ID);

      const res = await request(httpServer)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body as ApiResponse<ProfileData>;
      expect(body.data).toEqual(
        expect.objectContaining({
          id: TEST_USER_ID,
          username: 'admin',
          role: 'ADMIN',
          isActive: true,
        }),
      );
    });

    it('should return 401 without bearer token', async () => {
      await request(httpServer).get('/auth/me').expect(401);
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwtService.sign(
        {
          sub: TEST_USER_ID,
          sessionId: TEST_SESSION_ID,
          username: 'admin',
          role: 'ADMIN',
          type: 'access',
        },
        { secret: TEST_JWT_SECRET, expiresIn: '0s' },
      );

      await request(httpServer)
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
