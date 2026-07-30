# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — shared vocabulary for cross-cutting concepts (Master Data, Field Descriptor, Config Adapter, etc.).
- **`docs/adr/`** — read ADRs that touch the area you're about to work in before making non-trivial changes.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context layout (this repo):

```
/
├── CONTEXT.md           ← cross-domain vocabulary (Master Data, Field Descriptor, …)
├── docs/
│   └── adr/             ← system-wide architectural decisions
│       ├── 0001-master-data-package.md
│       ├── 0002-student-enrollment-direct-call.md
│       └── 0003-no-transaction-across-student-enrollment-writes.md
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0002 (student-enrollment-direct-call) — but worth reopening because…_
