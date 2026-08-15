import { SyncPermissionsUseCase } from './sync-permissions.use-case.js';
import { PermissionModule } from '../permission.module.js';
import { SYSTEM_PERMISSIONS } from '../constants/permission-codes.constants.js';
import type { IPermissionRepository } from '../domain/interfaces/permission-repository.interface.js';

/**
 * The catalogue has to reach a database nobody seeds.
 *
 * Production is populated through the UI and never runs a seed, so a permission
 * that exists in code and not in the database cannot be granted at all — it is
 * simply absent from the role screen, with nothing to explain why. Leaving the
 * sync to a remembered post-deploy step is the same omission that left
 * `system_key` NULL in this repository for three weeks.
 *
 * These assert the two properties that make doing it at boot safe: it runs, and
 * running it twice changes nothing.
 */
describe('permission catalogue sync on bootstrap', () => {
  function useCaseWithSpy() {
    const upsertPermission = jest.fn().mockResolvedValue(undefined);
    const repository = { upsertPermission } as unknown as IPermissionRepository;
    return {
      useCase: new SyncPermissionsUseCase(repository),
      upsertPermission,
    };
  }

  it('upserts every code the catalogue declares', async () => {
    const { useCase, upsertPermission } = useCaseWithSpy();

    await useCase.execute();

    expect(upsertPermission).toHaveBeenCalledTimes(SYSTEM_PERMISSIONS.length);
  });

  it('is idempotent: a second run asks for the same rows', async () => {
    const { useCase, upsertPermission } = useCaseWithSpy();

    await useCase.execute();
    const first = upsertPermission.mock.calls.map((c) => c[0]);
    upsertPermission.mockClear();

    await useCase.execute();
    const second = upsertPermission.mock.calls.map((c) => c[0]);

    expect(second).toEqual(first);
  });

  it('runs when the application boots', async () => {
    const { useCase, upsertPermission } = useCaseWithSpy();
    const module = new PermissionModule(useCase);

    await module.onApplicationBootstrap();

    expect(upsertPermission).toHaveBeenCalled();
  });

  /**
   * The five this feature added, named rather than counted: a catalogue that
   * silently lost one would still pass a count assertion.
   */
  it('carries the self-service codes', () => {
    const codes = SYSTEM_PERMISSIONS.map((p) => p.code);

    for (const code of [
      'students.read-own',
      'attendances.read-own',
      'report-cards.read-own',
      'student-scores.read-own',
      'schedules.read-own',
    ]) {
      expect(codes).toContain(code);
    }
  });
});
