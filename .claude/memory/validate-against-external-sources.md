---
name: validate-against-external-sources
description: "Don't treat this repo's own docs as the sole source of truth — cross-check rules against code, skills, and the web"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 87d7cfb5-e200-46c0-8ff8-980897cfff26
  modified: 2026-08-22T14:23:05.042Z
---

When establishing or reviewing architectural rules, do not treat the repo's own
documentation (`CLAUDE.md`, `backend/docs/NESTJS-RULES.md`, ADRs) as authoritative on
its own. Verify against three things: the actual code, the installed skills, and
external primary sources on the web.

**Why:** stated during the constitution work on 2026-08-06. A draft written from the
repo docs alone contained four rules the code contradicted (the public alias surface,
a missing package, a sanctioned role-check exception, an unenforceable `validate`
gate). A later external pass against the `nestjs-modular-monolith` skill, Prisma's
transaction docs, and pnpm guidance surfaced a whole missing principle — data
ownership and transaction boundaries. Docs drift; code and primary sources do not.

**How to apply:** measure claims against the codebase before writing them down (grep
for the violation and count it). When external advice conflicts with an in-repo
decision, do not silently adopt either — state the tension and record the reasoning,
as was done for ADR-0002's direct-call-over-events divergence.
