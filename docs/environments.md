# Environments

Three tiers: local, dev, production.

| | Local | Development | Production |
|---|---|---|---|
| Where | Your machine | VPS, `/var/www/241-Apps-dev` | VPS, `/var/www/241-Apps` |
| Branch | any | `dev` | `main` |
| Workflow | — | `deploy-dev.yml` | `deploy.yml` |
| GitHub environment | — | `development` | `production` |
| Secrets | — | `DEV_HOST`, `DEV_USERNAME`, `DEV_SSH_KEY`, `DEV_PORT?`, `DEV_APP_PATH?` | `PROD_HOST`, `PROD_USERNAME`, `PROD_SSH_KEY`, `PROD_PORT?`, `PROD_APP_PATH?` |
| pm2 process | — | `backend-241-dev` | `backend-241` |
| Database | its own | its own | its own |

Work merges to `dev` and lands on the dev box. When it is proven there, `dev`
merges to `main`. CI runs on both branches.

**`main` is not a place to try something.** A merge there deploys to the school
within minutes, so the order is never negotiable:

```
work -> dev -> deploys to development -> verified there -> PR dev->main -> production
```

`Promotion Guard` fails any pull request into `main` that does not come from
`dev`, or whose exact commit has no successful `Deploy to Development` run — it
queries the API for that run rather than taking the pull request's word for it.
`.husky/pre-push` refuses a direct push. Neither can *block* a merge without
branch protection, so they make a violation loud rather than impossible.

A new permission needs no step after the deploy. The catalogue is defined in
code and synced into the database on application bootstrap, so a code added in
this release is grantable through the role screen as soon as the box restarts.
`POST /permissions/sync` still exists for forcing it without one.

This matters most where it is least visible: production is populated through the
UI and never runs a seed, so a permission that exists in code but not in the
database cannot be granted at all — it simply does not appear on the role
screen, with nothing to explain why.

---

## What actually separates them

Not the branch name — **the database**.

Each box keeps its own `backend/.env`, and `.env*` is gitignored, so a deploy
never overwrites it. That file is the whole separation.

Both workflows run `prisma:deploy`, which applies migrations to whatever
`DATABASE_URL` the box holds. **Two boxes pointing at one database is not two
environments** — it is one database with two deployers racing to migrate it.

---

## Production deploys for real now

The production workflow reads `PROD_HOST` / `PROD_USERNAME` / `PROD_SSH_KEY`,
not the bare `HOST` / `USERNAME` / `SSH_KEY` it used to. Those older secrets
point at the dev box, and a production job able to read them would deploy
production onto dev the moment anything merged to `main`.

`deploy.yml` still skips when `PROD_HOST` is unset — a red cross on every merge
is noise, and noise on every merge is how a real failure gets scrolled past.
**That skip no longer applies.** The `production` environment has held
`PROD_HOST`, `PROD_USERNAME`, `PROD_SSH_KEY`, `PROD_PORT` and `PROD_APP_PATH`
since 2026-08-13, so a merge to `main` deploys.

Two things follow, and both are easy to get wrong while reading an older
version of this page:

- **A merge to `main` is a deployment to the school, not a rehearsal.** This
  document used to say production was not built yet. It was accurate when
  written and stopped being so the day the secrets were added; if you are
  planning a promotion on the strength of that sentence, stop.
- **The old repository-wide `HOST` / `USERNAME` / `SSH_KEY` / `PORT` still
  exist.** Nothing reads them; item 7 below is the outstanding cleanup.
  Credentials for the dev box, under names that read like production, are
  exactly the shape of the accident this section is about.

---

> Versions, prerequisites and the per-box `.env` contract are in
> [`vps-setup.md`](vps-setup.md). This document covers which branch goes where;
> that one covers what a box needs before either workflow can run on it.

## Turning the existing VPS into the dev box

**Done.** The runbook that lived here — repoint the database, switch the
checkout to `dev`, rename the pm2 process, point the frontends at this box's
API, move the secrets, run the workflow — was carried out, and the result is
the two-checkout layout described above.

It is removed rather than archived, for the reason this file exists to serve:
a completed runbook that still reads as instructions is a page telling you to
do work that is already done. `git log -- docs/environments.md` has it if a
second box is ever built.

One point from it is load-bearing enough to keep here rather than in history.
**A frontend must share a registrable domain with its API.** The refresh
cookie is `sameSite: 'strict'` (ADR-0010), so a frontend on a foreign domain
gets no cookie and therefore **no login at all** — and that cannot reproduce
locally, where everything is `localhost` and the port is not part of the site.

---

## Production: what is done, and what is not

Production was built as a **second checkout on the same VPS** rather than a
second box — `/var/www/241-Apps`, pm2 `backend-241`, port 3000, its own Nginx
site and its own `backend/.env`. Dev is `/var/www/241-Apps-dev`, `backend-241-dev`,
port 3001. Their `DATABASE_URL`s differ, which is the separation that actually
matters.

Done:

1. ~~New box, or a second checkout with its own `backend/.env`, pm2 process and
   Nginx site.~~ Second checkout, as above.
2. ~~Its own database.~~ The two connection strings are not the same.
3. ~~`apps/*/.env` pointing at the production API, sharing its registrable
   domain.~~
4. ~~Settings → Environments → **production** → `PROD_HOST`, `PROD_USERNAME`,
   `PROD_SSH_KEY`.~~ Added 2026-08-13, alongside `PROD_PORT` and
   `PROD_APP_PATH`.

Still open:

5. **Required reviewers on the `production` environment**, so a merge to `main`
   waits for a person.
6. **Protect `main`: require a pull request and the CI checks.** `dev` stays
   open.

   Both of these used to return `403 — Upgrade to GitHub Pro or make this
   repository public`. **Making the repository public removes that wall** —
   branch protection, rulesets and environment reviewers are all free on a
   public repository, which is the larger half of why going public was worth
   doing. The Actions quota was the smaller half.

   So this is now a task rather than a limitation, and it is the one that
   matters most here. Everything guarding `main` today is advisory:
   `Promotion Guard` reports rather than blocks, and `.husky/pre-push` is a
   guard on one machine that `--no-verify` walks past. Both catch the slip,
   neither catches the intent. A required check does.

7. **Delete the repository-wide `HOST` / `USERNAME` / `SSH_KEY` / `PORT`.**
   They still exist. Nothing reads them.

---

## Why migrations run before the builds

Both scripts migrate, then build the backend, then build the frontends, then
restart pm2.

That ordering is deliberate and was learned the hard way. Migrations used to run
*after* the five `*-web` builds, so when the database credentials were wrong the
script aborted having already overwritten what Nginx serves. Production spent a
day serving a new frontend against a backend that had never been rebuilt — the
frontend calling endpoints the running backend did not have.

The step most likely to fail on configuration now fails before anything is
replaced.

---

## Verifying the split

Once both exist, prove they are actually separate:

1. On each box: `cd backend && grep DATABASE_URL .env` — confirm they differ.
2. Push a trivial commit to `dev`. Watch Actions, then `pm2 status` on the dev
   box for `backend-241-dev`.
3. Confirm production did **not** restart — `backend-241` there should show an
   unchanged uptime.

Step 3 is the one that matters. The first two only prove dev works; the third
proves it is not production wearing a different name.
