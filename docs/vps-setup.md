# VPS setup — versions and prerequisites

What a box has to have before `deploy-dev.yml` or `deploy.yml` can run on it.

Every version below was read from this repository or from the running database,
not from memory. Where a range is given it is the one the packages themselves
declare.

---

## Runtime

| | Version | Where it comes from |
|---|---|---|
| **Node.js** | **22 LTS** (≥ 22.12) | Vite 7 declares `^20.19.0 \|\| >=22.12.0`, Prisma 7 declares `^20.19 \|\| ^22.12 \|\| >=24.0`. CI runs 22, so 22 is the version this code is actually proven on. |
| **pnpm** | **11.11.0**, exactly | `packageManager` in the root `package.json`. Installed via corepack, not npm — see below. |
| **PostgreSQL** | **16+** (production runs 18.4) | The live database reports `PostgreSQL 18.4`. Nothing in the schema needs a version that new; 16 is a safe floor. |
| **pm2** | any current | Process manager for the backend. |
| **Nginx** | any current | Serves each app's `dist/` and proxies the API. |
| **git** | any current | The deploy resets the checkout. |

Node 20.19+ also satisfies every declared range, but CI does not test it. Use 22
unless there is a reason not to.

### Installing pnpm

```bash
corepack enable
corepack prepare pnpm@11.11.0 --activate
```

Not `npm i -g pnpm`. The lockfile was written by 11.11.0, and `pnpm install
--frozen-lockfile` — which every deploy uses — fails on a mismatch rather than
resolving around it. pnpm 11 also reads `overrides` from `pnpm-workspace.yaml`;
pnpm 9 reads them from `package.json` and would silently drop every override
this repo has, including the ones answering security advisories.

### Postgres extensions

`pgcrypto` and `plpgsql`. `plpgsql` is present by default; `pgcrypto` is not:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### System libraries

None to install by hand. `sharp` 0.35 declares prebuilt binaries for
`linux-x64`, `linux-arm64` and their `linuxmusl` counterparts, so libvips does
not need to be present on Ubuntu, Debian or Alpine — pnpm resolves the right one
for the platform.

`pnpm-workspace.yaml` lists `sharp` under `allowBuilds`, which is what lets its
install script run. Without that entry pnpm skips it and the binary never
arrives, and the failure surfaces later as a runtime error on the first avatar
upload rather than at install time.

---

## Application layout

```
/var/www/241-Apps            # or DEV_APP_PATH / PROD_APP_PATH
├── backend/.env             # gitignored — the box's own
├── apps/<app>/.env          # gitignored — production values
├── apps/<app>/.env.development  # gitignored — dev values
├── apps/<app>/dist/         # what Nginx serves in production
└── apps/<app>/dist-dev/     # what Nginx serves in dev
```

The deploy runs `git reset --hard`, which never touches those `.env` files
because they are gitignored. They are the only thing that distinguishes one
environment from another.

---

## `backend/.env`

Copy from `backend/.env.example`. What must change per box:

| Variable | Note |
|---|---|
| `DATABASE_URL` | This box's own database. Pooled connection if the provider offers one. |
| `DIRECT_URL` | Unpooled connection, for migrations. On a plain Postgres it is the same string as `DATABASE_URL`. |
| `NODE_ENV` | `production` on both dev and production boxes — it selects the runtime mode, not the environment's name. |
| `PORT` | `3000` by default. If dev and production share a machine they must differ. |
| `TRUST_PROXY` | `1` behind Nginx, so rate limiting sees the real client address rather than `127.0.0.1`. |
| `JWT_SECRET` | **A different value per environment.** A shared secret means a dev token is accepted by production. |
| `FRONTEND_URL`, `PORTAL_BASE_URL`, `PPDB_BASE_URL` | This box's own URLs. |
| `S3_*` | Object storage for uploads. A separate bucket per environment, or dev writes into production's files. |

`SEED_*` only matter when seeding a fresh database and can be left as they are
otherwise.

---

## `apps/<app>/.env` and `.env.development`

One pair per frontend: `academic`, `inventory`, `admission`, `portal`,
`presence`.

| File | Loaded when | Build writes to |
|---|---|---|
| `.env` | always | `dist` |
| `.env.development` | `--mode development` only, and it overrides `.env` | `dist-dev` |

```bash
# .env — production
VITE_API_BASE_URL=https://api.<domain>

# .env.development — dev
VITE_API_BASE_URL=https://dev.api.<domain>
```

Both are gitignored, so `git reset --hard` never touches them and each box keeps
its own.

### The flag has to be passed exactly this way

```bash
pnpm -r --filter "*-web" build --mode development     # correct
pnpm -r --filter "*-web" build -- --mode development  # silently wrong
```

The second form reads as the conventional way to forward an argument, and it is
how npm behaves. pnpm consumes the separator, vite never receives the flag, and
the build lands in `dist` against the **production** API — with a zero exit code
and no output saying so. Verified both ways: only the first produces `dist-dev`.

A trailing slash on the URL is harmless either way; `packages/shared/src/utils/api.ts`
strips it.

Two things about this are easy to get wrong and both are silent.

**Vite bakes `VITE_*` into the bundle at build time.** Changing the file after a
deploy does nothing until the next build.

**The frontend must share a registrable domain with its API.** The refresh
cookie is `SameSite=strict` (ADR-0010), so a frontend on a different site
receives no cookie and therefore **cannot log in at all** — not merely losing the
shared session. This never reproduces locally, where everything is `localhost`
and the port is not part of the site.

So `app.dev.sekolah.id` with `api.dev.sekolah.id` works; `dev.vercel.app` with
`api.sekolah.id` does not.

---

## First run on a new box

```bash
# 1. Toolchain
node -v          # v22.x
corepack enable && corepack prepare pnpm@11.11.0 --activate

# 2. Checkout — dev box tracks `dev`, production tracks `main`
sudo mkdir -p /var/www/241-Apps && sudo chown "$USER" /var/www/241-Apps
git clone <repo> /var/www/241-Apps
cd /var/www/241-Apps && git checkout dev

# 3. Environment files (see the two sections above)
cp backend/.env.example backend/.env
for app in academic inventory admission portal presence; do
  cp apps/$app/.env.example apps/$app/.env
done

# 4. Database
psql -c 'CREATE DATABASE apps241;'
psql -d apps241 -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;'

# 5. Install, migrate, build, start
pnpm install --frozen-lockfile
cd backend
pnpm prisma:generate
pnpm prisma:deploy          # applies migrations; does not seed
pnpm build
pm2 start dist/src/main.js --name backend-241-dev   # backend-241 on production
pm2 save && pm2 startup
cd ..
pnpm -r --filter "*-web" build --mode development   # production: drop the flag
```

A fresh database has no accounts. Seed the first administrator with
`pnpm --filter backend seed:admin-minimal`; the schema deliberately has no
`prisma db seed`, so production never starts from sample data.

After this, every subsequent deploy is the workflow's job — it repeats steps 5
onward on each push.

---

## Verifying a box before trusting it

```bash
node -v                                   # 22.x
pnpm -v                                   # 11.11.0
psql -d <db> -c 'SELECT version();'       # 16+
cd backend && grep -E 'DATABASE_URL|JWT_SECRET' .env   # not another box's
pm2 status                                # one process, the right name
curl -sf localhost:3000/health && echo OK # the API answers (no auth: @Public)

# The built bundle points where you think it does. VITE_* is baked in, so this
# is the only way to know — the .env file on disk proves nothing about what
# was compiled.
grep -rhoE 'https://[a-z0-9.-]+' apps/academic/dist-dev/assets/*.js | sort -u | head
```

The `.env` check is the one that matters. Two boxes sharing a `DATABASE_URL` is
not two environments, and two boxes sharing a `JWT_SECRET` means a token minted
on one is accepted by the other.

---

## Related

- [`environments.md`](environments.md) — which branch deploys where, the secrets
  each workflow reads, and the ordered steps for turning the existing VPS into
  the dev box.
- [`adr/0010-shared-session-across-apps.md`](adr/0010-shared-session-across-apps.md)
  — why the cookie domain rule above is not optional.
