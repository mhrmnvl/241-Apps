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
