/**
 * Stands in for the ESM-only `file-type` package under ts-jest.
 *
 * `upload-file.use-case.ts` imports it for magic-byte validation, and it is
 * reached transitively by anything that pulls in `FileModule`. Jest's CJS
 * resolver cannot load the real package, and transforming it is a fight not
 * worth having for tests that never upload anything.
 *
 * Returning `undefined` mirrors "unrecognised bytes", which the upload use case
 * treats as a rejected file. Nothing in the e2e suite uploads, so this is never
 * called — and if a future e2e does upload, it will fail loudly rather than
 * silently accepting whatever it was given.
 */
export function fileTypeFromBuffer(): Promise<undefined> {
  return Promise.resolve(undefined);
}
