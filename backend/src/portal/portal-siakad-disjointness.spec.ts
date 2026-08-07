import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';

/**
 * FR-046: the portal's Pengumuman and Agenda are its own, and are wholly
 * disjoint from SIAKAD's classroom-scoped `Announcement` and `Event`.
 *
 * The requester's reason for a separate portal is that its operators may be
 * different people. A classroom announcement written for one class's parents
 * appearing on the school's public website would be a privacy failure, not a
 * feature — and it is precisely the kind of thing a well-meaning "reuse the
 * existing model" refactor would introduce.
 *
 * Asserted structurally rather than by hitting endpoints, because the guarantee
 * is about what the portal *can* reach, not about what one seeded row happens
 * to do. If no portal file can name those models, no portal response can
 * contain one — regardless of how the endpoints are exercised.
 */

const PORTAL_SRC = join(process.cwd(), 'src', 'portal');

/** SIAKAD models the portal must never touch. */
const FORBIDDEN_MODELS = [
  'prisma.announcement',
  'prisma.announcementClassroom',
  'prisma.event',
  'prisma.eventAudience',
  'prisma.eventClassroom',
];

/** Domains the portal must not import from at all. */
const FORBIDDEN_IMPORTS = ['/academic/', '/inventory/', '/admission/'];

async function portalSourceFiles(): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of glob('**/*.ts', { cwd: PORTAL_SRC })) {
    if (!entry.endsWith('.spec.ts')) files.push(entry);
  }
  return files;
}

describe('portal ↔ SIAKAD disjointness (FR-046)', () => {
  let sources: { path: string; text: string }[];

  beforeAll(async () => {
    const files = await portalSourceFiles();
    sources = await Promise.all(
      files.map(async (path) => ({
        path,
        text: await readFile(join(PORTAL_SRC, path), 'utf8'),
      })),
    );
  });

  it('finds portal source files to check', () => {
    // Guards the test itself: an empty sweep would pass every assertion below.
    expect(sources.length).toBeGreaterThan(20);
  });

  it.each(FORBIDDEN_MODELS)(
    "never queries SIAKAD's %s from anywhere in portal/",
    (model) => {
      const offenders = sources
        .filter((file) => file.text.includes(model))
        .map((file) => file.path);

      expect(offenders).toEqual([]);
    },
  );

  it('never imports from academic, inventory, or admission', () => {
    const offenders = sources
      .filter((file) =>
        FORBIDDEN_IMPORTS.some((domain) => file.text.includes(domain)),
      )
      .map((file) => file.path);

    expect(offenders).toEqual([]);
  });

  /**
   * The portal's announcements are `Post` rows with `type: PENGUMUMAN`, which
   * is what makes the separation structural: they live in a different table,
   * with a different lifecycle, reachable only through `portal-*` permissions.
   */
  it('models its own announcements as portal posts', async () => {
    const schema = await readFile(
      join(process.cwd(), 'prisma', 'portal.prisma'),
      'utf8',
    );

    expect(schema).toContain('PENGUMUMAN');
    expect(schema).toContain('@@map("portal_posts")');
    // And does not redeclare or extend SIAKAD's table.
    expect(schema).not.toContain('@@map("announcements")');
    expect(schema).not.toContain('@@map("events")');
  });
});
