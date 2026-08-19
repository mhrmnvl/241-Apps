/**
 * Stands in for `file-type` under Jest.
 *
 * The package is ESM-only and Jest cannot transform it, so every spec touching
 * an upload has had to mock the use case that imports it — which meant the
 * wiring around those use cases was never exercised at all. Mapping the package
 * here lets a test import the real module graph and stub only the leaf.
 *
 * Nothing asserts on file-type's behaviour today. If something ever needs to,
 * it should mock this stub explicitly rather than rely on the return below.
 */
export function fileTypeFromBuffer(): Promise<undefined> {
  return Promise.resolve(undefined);
}
