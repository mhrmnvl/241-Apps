import { ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import { LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import { PrismaModule } from '../src/core/database/prisma.module.js';
import { PrismaService } from '../src/core/database/prisma.service.js';
import { PayrollModule } from '../src/payroll/payroll.module.js';
import { IPermissionRepository } from '../src/platform/access-control/permission/domain/interfaces/permission-repository.interface.js';
import { PermissionGuard } from '../src/platform/access-control/permission/guards/permission.guard.js';
import { JwtAuthGuard } from '../src/platform/auth/guards/jwt-auth.guard.js';
import { PresenceModule } from '../src/presence/presence.module.js';

/**
 * FR-061 and FR-051: a `read-own` holder sees themselves and nobody else.
 *
 * Both `/me` routes are asserted at the query, not at the response: the
 * guarantee is that the caller's id comes from the token and can never come
 * from input, and the only way to show that is to look at what actually
 * reached persistence. A response-shape assertion would pass just as well
 * against a handler that trusted a `userId` query parameter.
 *
 * The paired half matters as much: the same account must be refused on the
 * routes that read everybody. A `/me` that is safe while the list beside it is
 * open protects nothing.
 *
 * No database — `PrismaService` is mocked. The claim is about routing and
 * authorisation, not about stored rows.
 */

const TEACHER_ID = '11111111-1111-4111-8111-111111111111';
const SOMEONE_ELSE = '22222222-2222-4222-8222-222222222222';

function authenticateAs(userId: string) {
  return {
    canActivate: (context: ExecutionContext) => {
      context.switchToHttp().getRequest<{ user: unknown }>().user = {
        id: userId,
        identifier: 'guru',
      };
      return true;
    },
  };
}

/** What an ordinary employee holds: their own records, nothing wider. */
const READ_OWN = ['presence-records.read-own', 'payroll-payslips.read-own'];

describe('presence & payroll self-service (FR-061, FR-051)', () => {
  let app: INestApplication;
  let server: Server;
  let granted: string[] = READ_OWN;

  const dailyPresence = { findMany: jest.fn().mockResolvedValue([]) };
  const payslip = { findFirst: jest.fn().mockResolvedValue(null) };

  const prismaMock = {
    dailyPresence,
    payslip,
    presenceCredential: { findMany: jest.fn().mockResolvedValue([]) },
    payrollRun: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
    },
    salaryComponent: { findMany: jest.fn().mockResolvedValue([]) },
    salaryAssignment: { findMany: jest.fn().mockResolvedValue([]) },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const permissionsMock = {
    findUserRoles: jest.fn(() => Promise.resolve([{ role: { code: 'GURU' } }])),
    findUserPermissions: jest.fn(() => Promise.resolve(granted)),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot({ pinoHttp: { enabled: false } }),
        PrismaModule,
        PresenceModule,
        PayrollModule,
      ],
      providers: [
        { provide: IPermissionRepository, useValue: permissionsMock },
        { provide: APP_GUARD, useValue: authenticateAs(TEACHER_ID) },
        { provide: APP_GUARD, useClass: PermissionGuard },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideGuard(JwtAuthGuard)
      .useValue(authenticateAs(TEACHER_ID))
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    granted = READ_OWN;
    dailyPresence.findMany.mockResolvedValue([]);
    payslip.findFirst.mockResolvedValue(null);
  });

  describe('GET /presence/daily-records/me', () => {
    it('queries the caller, not a parameter', async () => {
      await request(server)
        .get('/presence/daily-records/me')
        .query({ year: 2026, month: 7 })
        .expect(200);

      const [call] = dailyPresence.findMany.mock.calls as [
        { where: { userId: string } },
      ][];
      expect(call[0].where.userId).toBe(TEACHER_ID);
    });

    /**
     * The route takes no `userId`, so a supplied one is ignored rather than
     * honoured — asserted explicitly because "there is no parameter" is a
     * claim that quietly stops being true when someone adds a filter.
     */
    it('ignores a userId smuggled in as a query parameter', async () => {
      await request(server)
        .get('/presence/daily-records/me')
        .query({ year: 2026, month: 7, userId: SOMEONE_ELSE })
        .expect(200);

      const [call] = dailyPresence.findMany.mock.calls as [
        { where: { userId: string } },
      ][];
      expect(call[0].where.userId).toBe(TEACHER_ID);
      expect(call[0].where.userId).not.toBe(SOMEONE_ELSE);
    });
  });

  describe('GET /payroll/payslips/me', () => {
    it('queries the caller and only approved runs', async () => {
      await request(server).get('/payroll/payslips/me');

      const [call] = payslip.findFirst.mock.calls as [
        { where: { userId: string; payrollRun: { status: string } } },
      ][];
      expect(call[0].where.userId).toBe(TEACHER_ID);
      // A draft is still being recalculated; showing one misinforms rather
      // than informs.
      expect(call[0].where.payrollRun.status).toBe('APPROVED');
    });

    it('ignores a userId smuggled in as a query parameter', async () => {
      await request(server)
        .get('/payroll/payslips/me')
        .query({ userId: SOMEONE_ELSE });

      const [call] = payslip.findFirst.mock.calls as [
        { where: { userId: string } },
      ][];
      expect(call[0].where.userId).toBe(TEACHER_ID);
    });
  });

  describe('the wider routes stay shut', () => {
    it.each([
      '/presence/daily-records?date=2026-07-01',
      `/presence/daily-records/${SOMEONE_ELSE}`,
      '/presence/daily-records/recap?year=2026&month=7',
      `/payroll/payslips/${SOMEONE_ELSE}`,
      '/payroll/runs',
    ])('refuses %s for a read-own holder', async (path) => {
      const response = await request(server).get(path);

      expect(response.status).toBe(403);
    });
  });
});
