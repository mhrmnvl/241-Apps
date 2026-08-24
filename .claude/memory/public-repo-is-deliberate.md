---
name: public-repo-is-deliberate
description: mhrmnvl/241-Apps is a public GitHub repo on purpose — do not flag it as a leak
metadata: 
  node_type: memory
  type: project
  originSessionId: 1d9be3a4-59e3-4a45-b789-dd476f3c8521
  modified: 2026-08-24T03:35:40.520Z
---

`mhrmnvl/241-Apps` is **public on GitHub deliberately**. Confirmed by the user on
2026-08-24 when I raised it unprompted. Do not surface it again as an oversight.

**Why:** it is a school information system holding student data, so a public repo
reads like a mistake at first glance. It is not — `.env` and `.env.*` are
gitignored, so no credentials are in history; the schema, seeds, and endpoints
being readable is accepted.

**How to apply:**

- GitHub Actions is therefore **free and unlimited** here. Any advice weighed on
  CI minutes (self-hosting, Jenkins, trimming jobs to save quota) is arguing from
  a cost that does not exist — 508 runs in 30 days bill nothing.
- Branch protection is free on public repos and **is already configured** on
  `main` (required checks: `Promotion to production`, `Backend · …`,
  `Frontend · …`). `CLAUDE.md` still says protection needs GitHub Pro and that
  the promotion guard is only advisory — that paragraph is stale. Left
  unfixed as of 2026-08-24, pending the user's go-ahead; `enforce_admins` is
  `false`, so the user can still bypass.
- Never put a self-hosted Actions runner on the school's VPS while the repo is
  public: a fork PR would run a stranger's code beside production.

Related: [[ship-via-dev-after-green-ci]]
