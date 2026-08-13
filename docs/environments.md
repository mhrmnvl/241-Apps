# Environments

Three tiers: local, dev, production.

| | Local | Development | Production |
|---|---|---|---|
| Where | Your machine | The existing VPS | **Not built yet** |
| Branch | any | `dev` | `main` |
| Workflow | — | `deploy-dev.yml` | `deploy.yml` |
| GitHub environment | — | `development` | `production` |
| Secrets | — | `DEV_HOST`, `DEV_USERNAME`, `DEV_SSH_KEY`, `DEV_PORT?`, `DEV_APP_PATH?` | `PROD_HOST`, `PROD_USERNAME`, `PROD_SSH_KEY`, `PROD_PORT?`, `PROD_APP_PATH?` |
| pm2 process | — | `backend-241-dev` | `backend-241` |
| Database | its own | its own | its own |

Work merges to `dev` and lands on the dev box. When it is proven there, `dev`
merges to `main`. CI runs on both branches.

---

## What actually separates them

Not the branch name — **the database**.

Each box keeps its own `backend/.env`, and `.env*` is gitignored, so a deploy
never overwrites it. That file is the whole separation.

Both workflows run `prisma:deploy`, which applies migrations to whatever
`DATABASE_URL` the box holds. **Two boxes pointing at one database is not two
environments** — it is one database with two deployers racing to migrate it.

---

## Production cannot deploy by accident

The production workflow reads `PROD_HOST` / `PROD_USERNAME` / `PROD_SSH_KEY`,
not the bare `HOST` / `USERNAME` / `SSH_KEY` it used to. Those older secrets
still point at the box that is becoming dev, and a production job able to read
them would deploy production onto dev the moment anything merged to `main`.

While `PROD_HOST` is unset the job **skips with a notice and goes green**, rather
than failing. A red cross on every merge is noise, and noise on every merge is
how a real failure gets scrolled past.

---

> Versions, prerequisites and the per-box `.env` contract are in
> [`vps-setup.md`](vps-setup.md). This document covers which branch goes where;
> that one covers what a box needs before either workflow can run on it.

## Turning the existing VPS into the dev box

Do these in order. Step 1 is the one that matters.

### 1. Point it at a database that is not production's

The box currently has `DATABASE_URL` for `apps241` at `localhost:5432`, and
those credentials are rejected — `P1000`, every deploy since 12 August. Decide
what this box's database is *supposed* to be, and set it:

```bash
cd /var/www/241-Apps/backend
nano .env      # DATABASE_URL → the dev database
```

Whatever you choose, it must not be the database production will use. If the
Neon instance is the real data, give dev its own Neon **branch** rather than the
same connection string.

### 2. Switch the checkout to `dev`

```bash
cd /var/www/241-Apps
git fetch --all --prune
git checkout dev
git reset --hard origin/dev
```

The workflow resets to `origin/dev` on every run, so this is only needed once —
but do it before the first dev deploy, so the tree and the branch agree.

### 3. Rename the pm2 process

The dev workflow manages `backend-241-dev`. The box is currently running
`backend-241`. Leaving both would put two processes on one port:

```bash
pm2 delete backend-241     # the dev deploy starts backend-241-dev itself
pm2 save
```

### 4. Point the frontends at this box's API

```bash
cd /var/www/241-Apps
for app in academic inventory admission portal presence; do
  nano apps/$app/.env       # VITE_API_BASE_URL → this box's API
done
```

This matters more than it looks. The refresh cookie is `sameSite: 'strict'`
(ADR-0010), so a frontend must share a registrable domain with its API or it
gets no cookie and therefore **no login at all** — and that cannot reproduce
locally, where everything is `localhost`.

### 5. Move the secrets

Settings → Environments → **development** → add `DEV_HOST`, `DEV_USERNAME`,
`DEV_SSH_KEY` with the values the old `HOST` / `USERNAME` / `SSH_KEY` hold.
Add `DEV_PORT` / `DEV_APP_PATH` only if they differ from `22` and
`/var/www/241-Apps`.

Then **delete the old repository-wide `HOST` / `USERNAME` / `SSH_KEY`**. Nothing
reads them any more, and leaving credentials for a box under a name that sounds
like production is how the wrong thing gets deployed later.

### 6. Run it

Actions → *Deploy to Development* → *Run workflow*. It checks its secrets before
connecting, so a missing one is reported by name rather than as a connection
error.

---

## Building production later

1. New box, or a second checkout with its own `backend/.env`, pm2 process and
   Nginx site.
2. Its own database — a separate Neon project, not a branch of dev's.
3. `apps/*/.env` pointing at the production API, sharing its registrable domain.
4. Settings → Environments → **production** → `PROD_HOST`, `PROD_USERNAME`,
   `PROD_SSH_KEY`. The skip in `deploy.yml` turns itself off once `PROD_HOST`
   exists.
5. Add required reviewers on the `production` environment, so a merge to `main`
   waits for a person.
6. Protect `main`: require a pull request and the CI checks. `dev` stays open.

   **Not currently possible.** Both branch protection and rulesets return
   `403 — Upgrade to GitHub Pro or make this repository public` on a private
   repository under a free account, and so do environment reviewers. Until the
   plan changes, `.husky/pre-push` refuses a direct push to `main` — which is a
   guard on one machine, bypassable with `--no-verify`, and no substitute for
   the server-side rule. It catches the slip, not the intent.

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
