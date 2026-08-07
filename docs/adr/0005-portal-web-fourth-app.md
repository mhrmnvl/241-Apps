# School portal as a fourth application (`portal-web`)

**Context**: the school has no public website. The only public page in the workspace is `apps/admission`'s landing route (`LandingView.vue`, shell-less `/`), which serves admission waves and is otherwise hardcoded — hero copy, registration steps, and footer are all in the template. Publishing news, articles, agenda, galleries, or a school profile currently means a developer editing a `.vue` file and deploying. The requester asked for a CMS whose content appears on a landing page, and chose a dedicated portal over extending the PPDB app, on the grounds that the school website and the admission system will be operated by different people.

**Decision**: add a fourth frontend application, `apps/portal` (package name `portal-web`), serving both the public school website and the management area for its content. It gets its own top-level backend domain `backend/src/portal/` holding sibling modules, its own `AppKey.PORTAL`, and a permission namespace (`portal-*`) disjoint from academic, personnel, inventory, and admission permissions. `apps/admission` keeps its PPDB landing page unchanged; the portal links to it and never duplicates wave, quota, or registration data.

**Why not a route tree inside `apps/admission`**: four reasons, none of which is about code volume.

- **Different operators.** The requester's stated motivation. The humas team running the portal must not gain access to applicant records, and a SIAKAD administrator must not gain the right to publish to the school's public website. Separate apps make that boundary something you can see, rather than something enforced only by route guards inside one bundle.
- **Different availability requirement.** Maintenance mode is per-`AppKey`. A portal with its own key stays publicly readable while SIAKAD or PPDB is down for maintenance — structural, not a runtime check anyone has to remember (FR-003, SC-006).
- **Different audience and lifetime.** PPDB is seasonal and transactional; the portal is permanent and editorial. The PPDB landing is titled "Penerimaan Santri Baru", which is not the school's homepage and should not become it.
- **Blast radius.** A public marketing surface has no reason to share a bundle with an application that handles applicant personal data.

## Considered Options

- **Extend `apps/admission` with portal routes** — rejected for the four reasons above. It is the cheapest option today and the one that makes the operator split undeliverable.
- **CMS management inside `apps/academic`, public rendering inside `apps/admission`** — rejected: it splits one feature across two apps, so neither owns it, and it still leaves the portal's availability tied to SIAKAD's.
- **A new `packages/*` consumed by an existing app** — rejected: nothing here is used by a second app, and constitution II promotes to `packages/*` only when two or more apps consume the code. Promoting speculatively would be inventing a shared boundary that does not exist.
- **Nuxt/SSR for the portal instead of Vue 3 + Vite** — rejected for v1. It would introduce a second frontend framework into a workspace whose premise is one shared stack, and reopen how `packages/*` are consumed as raw source. The problem it would solve — link previews for crawlers that do not run JavaScript — is instead solved by having NestJS serve the portal's `index.html` with server-injected metadata. Recorded as the upgrade path if organic search ever outranks WhatsApp sharing.

## Consequences

- **The `-web` suffix is load-bearing.** Root scripts filter on `*-web`; an app named otherwise is silently excluded from `build`, `typecheck`, `lint`, `lint:strict`, `test`, and `format:check` while every script stays green. Verified at creation: the filter matches all four apps.
- **Aliases are declared twice** — `vite.config.ts` for runtime and `tsconfig.app.json` for types. Declaring one without the other yields a build that resolves but fails typecheck, or the reverse.
- **`AppKey` gains a fourth member**, which touches a shared enum and needs a Prisma migration. In exchange the portal gets branding, per-app maintenance mode, and a storage prefix for free.
- **The backend serves the portal's HTML.** This couples portal hosting to the API process, which is acceptable at this scale and separable later by putting a CDN in front, without touching the injection logic.
- **`@241/master-data` is declared as a portal dependency** because categories and tags are reference data and must go through that engine (ADR-0001) rather than a hand-built list view.
- Four apps now share `@241/platform`'s auth feature, which stays brand-neutral and is configured per app through `configureAuth()`. Forking it for the portal is forbidden.
