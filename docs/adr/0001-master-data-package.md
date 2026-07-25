# Master data CRUD collapse: dedicated package + config-as-port

**Context**: 17+ reference-data features (religion, blood type, education, occupation, ...) across `packages/platform` and `apps/academic` had near-identical ListView/FormDialog/columns/service code — the same CRUD shape rebuilt every time a new lookup entity was added.

**Decision**: extract the shared UI/validation/state logic into a new package, `@241/master-data`, rather than into `packages/shared` or `packages/platform`. Each entity keeps its own `service.ts` untouched and adds a small `config.ts` implementing `MasterDataConfig<T>` — a config-as-port adapter that declares fields, permissions, and service calls. The engine (`MasterDataListView`, `MasterDataFormDialog`, schema/column generation) consumes only the config, never the entity's concrete types.

**Why not `shared` or `platform`**: this isn't a generic utility (`shared`) and doesn't encode auth/session/profile concerns (`platform`) — it's a distinct generic subdomain (CRUD over simple reference data) with its own UI components, validation engine, and its own test suite (the first in the frontend workspace). Putting it in either existing package would blur that package's responsibility, and in `platform`'s case risked a circular dependency: entities that `platform` depends on would need to depend back on the new abstraction.

## Considered Options

- Extend `packages/shared` with generic table/form helpers — rejected; `shared` has no Vue-SFC/UI dependency today, and this would change that boundary.
- Extend `packages/platform` — rejected due to the circular-dependency risk above. `platform` may depend on `master-data`; never the reverse.
- A generated CRUD scaffolder (convention over configuration) instead of a runtime config object — rejected in favor of an explicit, typed `MasterDataConfig<T>` port. Easier to grep, easier to add a one-off field, and avoids introducing a code-generation step into a repo that otherwise consumes workspace packages as raw source.

## Consequences

- `MasterDataField` is a closed union (`text | boolean`) by design — extend it only when a second entity proves the need for a new kind, not speculatively.
- Field-level `readOnlyOnEdit` (added when `school-unit-type` needed an immutable `code` field, confirmed by `employment-type`/`position-category` needing the same) lives on the field descriptor itself, not as a config-level list — keeps all per-field behavior in one place instead of split across the config shape.
