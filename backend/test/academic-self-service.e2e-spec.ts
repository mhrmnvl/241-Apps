import { ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import { LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import { PrismaModule } from '../src/core/database/prisma.module.js';
import { PrismaService } from '../src/core/database/prisma.service.js';
import { ResponseInterceptor } from '../src/core/interceptors/response.interceptor.js';
import { ReportCardModule } from '../src/academic/report-card/report-card.module.js';
import { IPermissionRepository } from '../src/platform/access-control/permission/domain/interfaces/permission-repository.interface.js';
import { PermissionGuard } from '../src/platform/access-control/permission/guards/permission.guard.js';
import { JwtAuthGuard } from '../src/platform/auth/guards/jwt-auth.guard.js';

/**
 * `GET /rapors/me` — the self-service boundary, over HTTP.
 *
 * A student's report card is the most private thing academic holds, and the
 * route that serves it takes the same query DTO as the cohort route beside it.
 * That DTO has a `studentId`. The caller's own id is resolved from their token
 * and applied as a separate scope, and `get-report-cards.use-case.ts` spreads
 * that scope *after* the query so it wins — the file even says so:
 *
 *   > Spreading it the other way would let `?studentId=<someone else>` win
 *
 * Which is exactly the failure this file exists to catch, because it is
 * invisible from the outside. There is no error and no empty page: the caller
 * receives somebody else's marks in a response shaped exactly like their own.
 * A reordered object literal is enough to cause it, and reviewing a spread is
 * not a control.
 *
 * So the assertions read the `where` that reaches Prisma rather than the body.
 * The body would look plausible whichever id had won; the query is where the
 * answer actually is.
 *
 * No database: `PrismaService` and the permission repository are mocked, the
 * same shape as `payroll-authorization.e2e-spec.ts`.
 */

const CALLER_USER_ID = '11111111-1111-4111-8111-111111111111';
const CALLER_STUDENT_ID = '33333333-3333-4333-8333-333333333333';
const SOMEBODY_ELSE = '44444444-4444-4444-8444-444444444444';

function authenticateAs(userId: string) {
  return {
    canActivate: (context: ExecutionContext) => {
      context.switchToHttp().getRequest<{ user: unknown }>().user = {
        id: userId,
        identifier: 'siswa',
      };
      return true;
    },
  };
}

/**
 * The scope lands on the nested enrollment filter, not on the report card
 * itself — a report card belongs to a student through their enrolment.
 */
interface PrismaWhere {
  isPublished?: boolean;
  enrollment?: { studentId?: string; semesterId?: string };
}

describe('academic self-service (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  let grantedPermissions: string[] = [];

  const prismaMock = {
    student: { findFirst: jest.fn() },
    // Reads scope themselves to the active semester when the query names none
    // (CLAUDE.md: never read across all years), so the list query resolves one
    // before it runs.
    semester: {
      findFirst: jest.fn().mockResolvedValue({ id: 'sem-active' }),
    },
    reportCard: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findFirst: jest.fn().mockResolvedValue(null),
      aggregate: jest.fn().mockResolvedValue({ _avg: {} }),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  const permissionsMock = {
    findUserRoles: jest.fn(() =>
      Promise.resolve([{ role: { code: 'STUDENT' } }]),
    ),
    findUserPermissions: jest.fn(() => Promise.resolve(grantedPermissions)),
  };

  /** The `where` the list query actually ran with. */
  function whereOfListQuery(): PrismaWhere {
    expect(prismaMock.reportCard.findMany).toHaveBeenCalled();
    const args = prismaMock.reportCard.findMany.mock.calls[0][0] as {
      where: PrismaWhere;
    };
    return args.where;
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        // Inline rather than from the environment — see the note in
        // `payroll-authorization.e2e-spec.ts`.
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: 'test-jwt-secret-for-e2e-testing-minimum-32-chars',
              NODE_ENV: 'test',
            }),
          ],
        }),
        LoggerModule.forRoot({ pinoHttp: { enabled: false } }),
        PrismaModule,
        ReportCardModule,
      ],
      providers: [
        { provide: IPermissionRepository, useValue: permissionsMock },
        { provide: APP_GUARD, useValue: authenticateAs(CALLER_USER_ID) },
        { provide: APP_GUARD, useClass: PermissionGuard },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideGuard(JwtAuthGuard)
      .useValue(authenticateAs(CALLER_USER_ID))
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.student.findFirst.mockResolvedValue({ id: CALLER_STUDENT_ID });
    prismaMock.semester.findFirst.mockResolvedValue({ id: 'sem-active' });
    prismaMock.reportCard.findMany.mockResolvedValue([]);
    prismaMock.reportCard.count.mockResolvedValue(0);
    prismaMock.reportCard.aggregate.mockResolvedValue({ _avg: {} });
    grantedPermissions = ['report-cards.read-own'];
  });

  describe('GET /rapors/me', () => {
    // Asserted on the query rather than on the scope handed to the repository.
    // That distinction is the whole point: the scope *was* passed correctly
    // once while being dropped on the way to Prisma, because three spreads
    // wrote the same key and the semester fallback — always present — won.
    // `GET /rapors/me` returned the whole school to a student, and the
    // use-case tests stayed green throughout, because they mock the repository
    // this assertion looks inside.
    it('reads the caller and nobody else', async () => {
      await request(server).get('/rapors/me').expect(200);

      expect(whereOfListQuery().enrollment?.studentId).toBe(CALLER_STUDENT_ID);
    });

    // The attack. A response built from somebody else's id looks exactly like
    // a response built from the caller's, so the id in the query is the only
    // place the difference is visible.
    it('ignores a studentId supplied by the caller', async () => {
      await request(server)
        .get('/rapors/me')
        .query({ studentId: SOMEBODY_ELSE })
        .expect(200);

      const where = whereOfListQuery();
      expect(where.enrollment?.studentId).toBe(CALLER_STUDENT_ID);
      expect(where.enrollment?.studentId).not.toBe(SOMEBODY_ELSE);
    });

    // The semester fallback is the value that once overwrote the student
    // scope. Both must survive together, so both are asserted together.
    it('keeps the student scope alongside the semester fallback', async () => {
      await request(server).get('/rapors/me').expect(200);

      const enrollment = whereOfListQuery().enrollment;
      expect(enrollment?.studentId).toBe(CALLER_STUDENT_ID);
      expect(enrollment?.semesterId).toBe('sem-active');
    });

    // The self-service route serves published cards only. A draft is a
    // teacher's working copy, and the same override that pins the student
    // pins this.
    it('forces the published filter regardless of what was asked for', async () => {
      await request(server)
        .get('/rapors/me')
        .query({ isPublished: 'false' })
        .expect(200);

      expect(whereOfListQuery().isPublished).toBe(true);
    });

    // A caller with no student record must get an empty answer, not a read
    // with the filter quietly dropped — which would return the whole school.
    it('answers empty for a caller who is not a student, without querying', async () => {
      prismaMock.student.findFirst.mockResolvedValue(null);

      await request(server).get('/rapors/me').expect(200);

      expect(prismaMock.reportCard.findMany).not.toHaveBeenCalled();
    });
  });

  describe('the permission is the boundary', () => {
    it('refuses the cohort route to a caller holding only read-own', async () => {
      grantedPermissions = ['report-cards.read-own'];

      await request(server).get('/rapors').expect(403);
    });

    it('refuses the self-service route to a caller holding neither', async () => {
      grantedPermissions = [];

      await request(server).get('/rapors/me').expect(403);
    });
  });
});
