/**
 * A hermetic environment, set before AppModule is imported.
 *
 * `ConfigModule` validates the environment with Zod and throws when a required
 * variable is missing, so this test passed on a machine with `backend/.env` and
 * failed in CI, where there is none — which is the same mistake in miniature as
 * the one it exists to catch: verified where the conditions happened to be
 * right rather than where they are guaranteed.
 *
 * The values are obviously fake and never used: `compile()` builds the injector
 * without `onModuleInit`, so nothing connects to a database or an object store.
 * Only their presence is required.
 */
process.env.DATABASE_URL ??= 'postgresql://boots:boots@localhost:5432/boots';
process.env.JWT_SECRET ??= 'boots-test-secret-not-a-real-key';
process.env.S3_ENDPOINT ??= 'http://localhost:9000';
process.env.S3_BUCKET ??= 'boots';
process.env.S3_ACCESS_KEY_ID ??= 'boots';
process.env.S3_SECRET_ACCESS_KEY ??= 'boots';

import { Test } from '@nestjs/testing';
import { AppModule } from './app.module.js';

// `file-type` is ESM-only and Jest cannot transform it; jest.config maps it to
// a stub so the real module graph can be imported. Puppeteer, behind the rapor
// PDF service, is stubbed at the leaf for the same reason — and stubbing a leaf
// leaves every edge into it intact, which is what this test is about.
jest.mock('./academic/report-card/services/pdf.service.js', () => ({
  PdfService: jest.fn(),
}));

/**
 * The application can be wired.
 *
 * Nest resolves dependencies at boot and nowhere else, so a provider injected
 * into a module that does not import the module exporting it compiles, passes
 * lint, passes every unit test, builds — and then the process dies on start.
 * That happened: `GetMyTeachingAssignmentsUseCase` asked for
 * `ITeacherIdentityReadPort` in a module that never imported `TeacherModule`,
 * CI went green on all five checks, and the development box went into a restart
 * loop. It had happened once before with `PrismaService`.
 *
 * `compile()` builds the injector without calling `onModuleInit`, so nothing
 * connects to a database or opens a port. It answers one question only, and it
 * is the question the other checks cannot ask: does every dependency have a
 * provider that reaches it.
 */
describe('AppModule', () => {
  it('resolves every dependency it declares', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  }, 120_000);
});
