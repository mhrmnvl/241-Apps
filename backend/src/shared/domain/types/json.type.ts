/**
 * A JSON document as the domain sees it.
 *
 * Columns declared `Json` in the schema cross the persistence boundary as these
 * rather than as `unknown` or the ORM's own input union: `unknown` forces every
 * reader to re-assert a shape, and the ORM type would leak persistence into the
 * domain. `JsonObject` is assignable to the ORM's input type, so adapters need
 * no cast.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | JsonObject;

/**
 * Values are optional because a JSON object read back from the database may
 * simply not carry a key — matching the ORM's own object shape, so rows flow
 * into this type and inputs flow out of it without an assertion either way.
 */
export interface JsonObject {
  [key: string]: JsonValue | undefined;
}
