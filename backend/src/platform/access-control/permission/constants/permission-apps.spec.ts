import { SYSTEM_PERMISSIONS } from './permission-codes.constants.js';
import {
  PERMISSION_APPS,
  appForModule,
  classifiedModules,
  isModuleClassified,
} from './permission-apps.constants.js';

/**
 * Every permission belongs to an application, and the role screen groups by it.
 *
 * The failure this prevents is quiet. A module added to the catalogue and not
 * classified here falls back to `platform`, so it appears — but under the wrong
 * heading, and an operator building "Admin Akademik" simply never sees it. The
 * role comes out missing a permission nobody noticed was missing.
 *
 * The reverse mistake is worse and is why the mapping is not derived from the
 * code's name: four presence modules carry no `presence-` prefix, so a
 * prefix-based grouping would file the leave system under academic and grant it
 * to an academic administrator.
 */
describe('permission applications', () => {
  const modules = [...new Set(SYSTEM_PERMISSIONS.map((p) => p.module))].sort();

  it('classifies every module in the catalogue', () => {
    const unclassified = modules.filter((m) => !isModuleClassified(m));

    expect(unclassified).toEqual([]);
  });

  it('classifies nothing that is not in the catalogue', () => {
    // The other direction, and it has to read the mapping's own keys to mean
    // anything. Deriving them from the catalogue — as a first version of this
    // did — makes a test that cannot fail.
    const known = new Set(modules);
    const stale = classifiedModules().filter((m) => !known.has(m));

    expect(stale).toEqual([]);
  });

  /**
   * The four that make a name-based grouping wrong. Named individually,
   * because a count would pass while any one of them moved.
   */
  it('files the unprefixed presence modules under presence', () => {
    for (const module of [
      'leave-requests',
      'leave-types',
      'work-patterns',
      'non-working-days',
    ]) {
      expect(appForModule(module)).toBe('presence');
    }
  });

  it('keeps the keys to the building in the system group', () => {
    for (const module of ['roles', 'permissions', 'users', 'sessions']) {
      expect(appForModule(module)).toBe('platform');
    }
  });

  it('falls back to the group handed out sparingly, not to academic', () => {
    expect(appForModule('a-module-nobody-classified')).toBe('platform');
  });

  it('offers every app key as a labelled group', () => {
    const labelled = new Set(PERMISSION_APPS.map((a) => a.key));
    const used = new Set(modules.map((m) => appForModule(m)));

    for (const app of used) {
      expect(labelled).toContain(app);
    }
  });
});
