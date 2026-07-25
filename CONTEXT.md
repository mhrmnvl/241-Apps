# 241-Apps

Shared vocabulary for concepts that cut across `academic`, `inventory`, and `admission` — not domain-specific to any one app.

## Language

**Master Data**:
A simple reference/lookup entity (e.g. religion, blood type, education level, occupation) — admin-managed via basic CRUD, referenced by ID from other domains, with no business logic of its own.
_Avoid_: Lookup table, reference data, master table

**Field Descriptor**:
A data-driven declaration (key, kind, label, validation rules) that generates a Master Data entity's table column, form field, and validation schema from one source of truth.
_Avoid_: Column definition, form field config

**Config Adapter**:
The per-entity object (`config.ts`) that implements `MasterDataConfig<T>`, wiring an entity's existing service, permissions, and field descriptors into the shared Master Data engine.
_Avoid_: Controller, view model, entity service

**readOnlyOnEdit**:
A field-descriptor property marking a field as settable only at creation — rendered disabled on edit and dropped from the update payload.
_Avoid_: Immutable field, locked field
