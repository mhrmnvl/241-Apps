# Environments

Two branches, two deployments, two databases.

| | Development | Production |
|---|---|---|
| Branch | `dev` | `main` |
| Workflow | `.github/workflows/deploy-dev.yml` | `.github/workflows/deploy.yml` |
| GitHub environment | `development` | `production` |
| Secrets | `DEV_HOST`, `DEV_USERNAME`, `DEV_SSH_KEY`, `DEV_PORT?`, `DEV_APP_PATH?` | `HOST`, `USERNAME`, `SSH_KEY`, `PORT?` |
| pm2 process | `backend-241-dev` | `backend-241` |
| Server resets to | `origin/dev` | `origin/main` |

Work merges to `dev` and deploys there. When `dev` is proven, it merges to
`main` and deploys to production. CI runs on both.

---

## The thing that actually separates them

Not the branch name — **the database**.

Each server keeps its own `backend/.env`, and `.env*` is gitignored, so a deploy
never overwrites it. The dev box's `DATABASE_URL` points at the dev database and
the production box's at the production one; that file is the whole separation.

This matters more than it looks, because both workflows run `prisma:deploy`,
which applies migrations to whatever `DATABASE_URL` the box holds. **Two servers
pointing at one database is not two environments** — it is one database with two
deployers racing to migrate it.

> Until a second database exists, do not point `DEV_HOST` at a box whose
> `backend/.env` carries the production `DATABASE_URL`. A `dev` branch deploying
> there migrates production.

---

## Setting up the development environment

The repository side is done. These four steps are not — they need access this
repository does not have.

### 1. A second database

A separate Postgres. On Neon, a **branch** of the existing project is the
cheapest form and gives a copy of the current data to test against; a separate
project is the stricter form. Either way it must be a different connection
string from the production one.

### 2. A dev server, or a second checkout

Either a second VPS, or a second directory on the existing box — a second
directory only works if it has its own `backend/.env`, its own pm2 process
(`backend-241-dev`, already the name the workflow uses) and its own Nginx site
and port. Set `DEV_APP_PATH` if it is not `/var/www/241-Apps`.

On that box, once:

```bash
git clone <repo> <path> && cd <path>
git checkout dev
cp backend/.env.example backend/.env    # then point DATABASE_URL at the dev DB
for app in academic inventory admission portal presence; do
  cp apps/$app/.env.example apps/$app/.env   # VITE_API_BASE_URL → the dev API
done
```

`apps/*/.env` matters as much as the backend's: every frontend must share a
registrable domain with its API, because the refresh cookie is `sameSite:
'strict'` (ADR-0010). A dev frontend pointed at the production API gets no
cookie and therefore no login at all — and this cannot reproduce locally, where
everything is `localhost`.

### 3. The GitHub environment and its secrets

Settings → Environments → **New environment** → `development`. Add
`DEV_HOST`, `DEV_USERNAME`, `DEV_SSH_KEY`, and `DEV_PORT` / `DEV_APP_PATH` if
they differ from the defaults.

Environment secrets rather than repository secrets, deliberately: the production
job cannot read them, which is what stops a mistake in one workflow reaching the
other server.

`deploy-dev.yml` checks these before it connects and fails with the missing
names. Without that check an unset host reads as a connection error, which sends
whoever is debugging to the network instead of to Settings.

### 4. Protect `main`

Settings → Branches → add a rule for `main`: require a pull request, and require
the CI check. `dev` stays open so work can land quickly.

---

## Verifying the split

Before trusting it, prove the two are actually separate:

1. On the dev box: `cd backend && grep DATABASE_URL .env` — confirm it is *not*
   the production string.
2. Push a trivial commit to `dev`. Watch the Actions run, then check
   `pm2 status` on the dev box for `backend-241-dev`.
3. Confirm production did **not** restart: `pm2 status` there should show
   `backend-241` with an unchanged uptime.

Step 3 is the one that matters. The first two only prove dev works; the third
proves it is not production wearing a different name.
