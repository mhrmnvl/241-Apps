/** One thing that references a file, in terms a person can read. */
export interface FileUsageReference {
  /** e.g. `Berita "Juara 1 Olimpiade"` */
  label: string;
  /** Whether that referencing item is currently public. */
  isPublic: boolean;
}

/**
 * Lets a domain module veto the deletion of a file it depends on, without
 * `platform/` learning anything about that module.
 *
 * The dependency points inward: platform declares the abstraction, and whoever
 * cares implements it. `portal/media` is the first implementer — deleting a
 * file that a published article renders would leave a broken image on the
 * school's website, which no amount of care at the call site prevents (FR-058).
 *
 * Injected `@Optional()` on purpose. With no implementer registered, deletion
 * behaves exactly as it did before this port existed, so a unit test or a
 * deployment without the portal is unaffected.
 */
export abstract class IFileUsageChecker {
  abstract findReferences(fileId: string): Promise<FileUsageReference[]>;
}
