# Engineering Rules

The binding rules for this repo, consolidated from eight agent skills
(`nestjs-best-practices`, `nestjs-modular-monolith`, `domain-driven-design`,
`clean-architecture`, `clean-code`, `vue-best-practices`,
`vue-pinia-best-practices`, `vue-router-best-practices`).

Where a skill contradicted this repo, the repo's convention was adopted and the
reason recorded in [Adopted decisions](#adopted-decisions) — so the same debate
does not get re-run every session. Rules carry IDs (`BE-06`, `FE-24`) so they
can be cited directly in review.

This file is operational. The authoritative sources stay `CLAUDE.md`,
`backend/docs/NESTJS-RULES.md`, `backend/docs/IAM.md`, `docs/adr/`, and
`.specify/memory/constitution.md`.

**Verified stack** — Vue 3.5 · Pinia 3.0 · Vue Router 5.1 · TanStack Vue Query 5 ·
NestJS + Prisma · pnpm 11 workspace. Version-gated rules below were checked
against the installed versions, not assumed.

---

## Order of precedence

Read top-down. Once a level answers the question, lower levels are not consulted.

1. **The user's instruction in the running conversation.** Including when they
   restate something already questioned — that is their call.
2. **Repo documents.** `CLAUDE.md`, `backend/docs/NESTJS-RULES.md`,
   `backend/docs/IAM.md`, `docs/adr/`, `.specify/memory/constitution.md`.
3. **The code and git history.** Where a document and the code disagree, the
   running code is the fact; the document is what needs fixing.
4. **Official docs for the installed version** (via Context7). Mandatory for
   anything version-dependent — skills are written against older versions more
   often than it looks.
5. **Skills.** Apply unless they conflict with the four levels above. When two
   skills conflict, take the stricter one with a mechanical reason behind it,
   not the newer one.

**Skill order for a new task:** DDD fixes the model and domain boundaries →
Clean Architecture fixes the direction of dependencies → NestJS/Vue practices
fill in implementation detail → Clean Code tidies the surface. The repo decides
at every step.

---

## Universal rules

| ID | Rule |
|---|---|
| UNI-01 | Names reveal intent. Classes are nouns, methods are verbs. `Manager`, `Helper`, `Processor`, `Data`, `Utils` may not be the last word of a name. Difficulty naming something is a signal the model is wrong — not a reason to add a suffix. |
| UNI-02 | One function, one level of abstraction. Do not mix high-level business rules with low-level detail (regex, parsing, queries) in one body. |
| UNI-03 | 0–2 arguments is normal, 3+ needs a reason. More than 3–4 dependencies in a use case or composable is a signal to split, not to introduce a parameter object. |
| UNI-04 | Comments explain **why**, not **what**. A comment explaining a complicated condition becomes a named function. A comment recording a decision or a trap stays — this repo uses those well. |
| UNI-05 | Law of Demeter. Avoid `a.b().c().d()` chains; in Prisma this shows up as nested relations reached from a use case. |
| UNI-06 | `T \| null` in a signature is a contract, not a trap. Under `strictNullChecks` the compiler enforces it. This overrides Clean Code's "never return null", which was written for a language without nullable types. |
| UNI-07 | Source dependencies always point inward. Domain never imports infrastructure. The interface belongs to the high-level module that needs it, not the low-level module that provides it. |
| UNI-08 | No `any`. Type-aware `lint:strict` must stay green on both sides. |
| UNI-09 | Delete stale docs rather than archiving them. A doc that contradicts the code is worse than no doc; git history is the archive. |
| UNI-10 | Surgical changes. Do not "improve" adjacent modules outside the task. Match the existing style even where you would write it differently. Mention unrelated problems; do not silently fix them. |

---

## Backend rules — NestJS + Prisma

`NESTJS-RULES.md` is the authority; this is its operational form plus the
non-conflicting additions from the skills.

### Structure and layering

| ID | Rule |
|---|---|
| BE-01 | Controller → Use Case → Repository port → Prisma. Controllers are thin and HTTP-only. Controllers and use cases never touch Prisma directly. |
| BE-02 | One use case = one business operation. Several small classes beat one large `XxxService`; `services/` is only for stateless helpers. Size: 50–150 lines ideal, 200+ review, 300+ refactor. |
| BE-03 | The port lives in `domain/interfaces/`, its Prisma implementation in `infrastructure/persistence/`, wired in the module as `{ provide: IXxxRepository, useClass: PrismaXxxRepository }`. There is no `repositories/` folder. |
| BE-04 | File budgets (code only — imports and `@Api*` decorators do not count): use case/service ≤300 lines, repository ≤200, controller ≤150 lines of code, anything else ≤300. Judge handler bodies, not `wc -l`. |

### Data contracts

| ID | Rule |
|---|---|
| BE-05 | `*Dto` and `*Input` are two boundaries, not two styles. A DTO is the HTTP shape (class-validator + Swagger); an Input is the repository port shape (plain interface). Map DTO → Input **field by field** in the use case — structural typing makes a pass-through compile, which is how an unwanted field silently reaches persistence. |
| BE-06 | Read only the fields the caller shows. Every read reaching a `Profile` uses `USER_REF_SELECT`, `USER_DISPLAY_SELECT`, or `USER_ROSTER_SELECT`. `profile: true` is a defect, and so is `include` on a user relation — `User` owns `passwordHash`. Domain rows must type their fields non-optional; optional fields cannot catch a narrowing. |
| BE-07 | Responses use the global interceptor's envelope `{ statusCode, message, data, meta? }` — there is no `success` field. Repositories return `{ data, total, page, limit }`. |
| BE-08 | No inline types and no magic strings/constants inside use cases — put them in `types/` and `constants/`. Narrow projections in a signature (`Promise<{ id: string } \| null>`) are fine. |

### Authorization and scoping

| ID | Rule |
|---|---|
| BE-09 | Check permissions, never role name strings: `@RequirePermissions('students.create')` — module segment plural. Only `SUPER_ADMIN` bypasses; `ADMIN` is an ordinary role bounded by its grants (ADR-0011). |
| BE-10 | Reading your own record is a separate permission and a separate route. `report-cards.read-own` via `GET /rapors/me`, declared before its `:id` sibling. The caller's identity is applied *after* their query. A caller with no record gets an explicit empty result, never a read with the filter dropped. Cohort-shaped reads are refused, not narrowed. A route that does not use the caller must not ask for one — `no-ignored-caller.spec.ts` enforces this. |
| BE-11 | Scope every query by `deletedAt: null` plus the relevant period (`semesterId` / `academicYearId`), falling back to the active semester rather than reading across all years. Single-school deployment: there is no `organizationId`, and `academic/` does not filter by `schoolUnitId`. |

### Behaviour and integration

| ID | Rule |
|---|---|
| BE-12 | Domain events are not used. A 1:1 must-succeed consequence is a direct awaited call (ADR-0002). Cross-domain reads go through one-way ports (`IDailyPresenceReadPort`); presence never reads back. This overrides the event-driven advice in three separate skills — `@nestjs/event-emitter` is not installed. |
| BE-13 | Throw NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, …), never a bare `throw new Error()`. Custom exceptions are optional and always extend a built-in. |
| BE-14 | Use transactions for multi-step operations that must succeed or fail together. In payroll: rounding is per line then summed, never the reverse; an assignment is superseded rather than overwritten; an `APPROVED` run is terminal and corrected only by an adjustment run. |
| BE-15 | NodeNext imports carry the `.js` extension. Never import a NestJS Module class or a cross-module DTO through a barrel — the barrel also re-exports the Module and use cases, so a DTO importing it closes an ESM cycle and crashes boot. |
| BE-16 | The backend is written in English. Three exceptions: rendered documents (report-card template, import/export spreadsheet headers), messages delivered verbatim to a person (password-reset email, admission notifications), and seed data under `prisma/seeds/`. |
| BE-17 | Adopted from the skills unchanged: global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` + `transform`; declarative guards via `APP_GUARD`; stricter rate limits on auth endpoints; validated config through `ConfigService` rather than scattered `process.env`; structured logging with request context and redacted credentials, never `console.log`; `enableShutdownHooks()`; async lifecycle hooks awaited rather than fire-and-forget. |
| BE-18 | Unit tests use `Test.createTestingModule` with the **port** mocked — not Prisma. The architectural sweep specs (`presence-academic-direction`, `no-user-scalar-overfetch`, `no-ignored-caller`, `presence-roster-independence`, `portal-public-visibility`) must stay green; they are the architecture's guardrails, not ordinary tests. |

---

## Frontend rules — Vue 3.5 · Pinia 3 · Vue Router 5

Installed versions are verified, so `defineModel` (needs 3.4+) and
`useTemplateRef` (needs 3.5+) are both available and are the default.

### Boundaries and structure

| ID | Rule |
|---|---|
| FE-01 | One domain = one feature: `api/ services/ stores/ composables/ components/ views/ types/` plus `index.ts` as the only public API. |
| FE-02 | Apps import only through public aliases — `@/ui`, `@/shared`, `@/master-data`, `@/features/platform/<feature>`. Subpaths under the first three are part of that public surface; a platform **feature barrel** is not — import from `@/features/platform/auth`, never `…/auth/stores/authStore`. |
| FE-03 | No app imports another app. Cross-app needs go over HTTP with narrow read models declared locally — `features/lookup` in presence-web is the reference (ADR-0009). |
| FE-04 | Code used by two or more apps moves to `packages/*`; app-specific code (`menuConfig`, `AppSidebar`) stays put. `@241/master-data` must never import `@241/platform` — that cycle is why it is its own package (ADR-0001). |
| FE-05 | Split a component when **any** holds: it owns orchestration/state *and* presentational markup for several sections; it has 3+ distinct UI sections; or a template block repeats and could be reusable. Route and root components stay thin composition surfaces. |

### Reactivity and templates

| ID | Rule |
|---|---|
| FE-06 | Keep source state minimal and derive everything with `computed`. Watchers are for side effects only. Computed getters stay pure — no mutation, API calls, or emits. |
| FE-07 | `ref()` remains the default for primitives. `shallowRef` is for opaque objects (class instances, SDK handles) or large data updated by replacing the root reference. This overrides the skill's "always shallowRef for primitives": `reactive()` is only applied to object values, so `ref` never proxies a primitive — the benefit is nil and the cost is inconsistency. |
| FE-08 | Never destructure `reactive()` (use `toRefs`), and always watch it through a getter: `watch(() => state.x, …)`. |
| FE-09 | Derivations belong in the script, not the template. No `.filter()`, `.sort()`, or function calls inside `v-for`; long conditional class logic becomes a `computed`. |
| FE-10 | `v-for` always carries a stable, primitive `:key` — not an index, not an object. Never put `v-if` and `v-for` on the same element. |
| FE-11 | `v-html` only for sanitized HTML (DOMPurify in a `computed`). Most relevant in portal-web, which renders CMS content. |
| FE-12 | Choose `v-if` vs `v-show` by toggle frequency: frequently toggled → `v-show`; rarely shown and expensive → `v-if`. |

### Component contracts

| ID | Rule |
|---|---|
| FE-13 | Props down, events up. Props are read-only. Component events do not bubble — a grandchild event must be re-emitted explicitly. |
| FE-14 | Type the contracts: `defineProps<T>()`, `defineEmits<T>()`, `defineSlots<T>()`, `defineModel()` for v-model, and `InjectionKey<T>` + `Symbol` for provide/inject. |
| FE-15 | Prefer props/emit over component refs. Where imperative access is genuinely needed, narrow the surface with `defineExpose` and take the ref with `useTemplateRef`. |
| FE-16 | provide/inject only for deep trees (beyond ~3 layers). Provide state as `readonly` plus explicit actions; consumers never mutate directly. |
| FE-17 | Extract a composable when logic is reusable, stateful, or side-effect heavy. Small typed API; options object when there are several optional parameters. Pure utilities stay in `utils/` — a `useFormatters()` that only wraps `Intl` is an anti-pattern. |

### State ownership

| ID | Rule |
|---|---|
| FE-18 | **Reference/master lists belong to TanStack Vue Query; everything else belongs to Pinia.** The `queryClient` is created in `@241/platform/reference-data` rather than left to the plugin default, so services — plain objects called imperatively — can `fetchQuery` on it while components `useQuery` against the same instance. Never mirror a reference list into a Pinia store. Reference keys are namespaced `['reference', key]`; if `useQuery` is adopted for anything else (a paginated table, a detail record), namespace its keys so they cannot collide. |
| FE-19 | Setup stores must return **all** state. The repo uses `defineStore('x', () => { … })`, so state left out of the return disappears from DevTools and is invisible to plugins. Mark internals with a `_` prefix but still return them. |
| FE-20 | `storeToRefs()` for state and getters; destructure actions directly. Never mix them — an action passed through `storeToRefs` comes back `undefined`. |
| FE-21 | Call `useXxxStore()` only inside setup, a composable, or a function body — never at module level. A static `defineStore` import at the top of a file is fine; it is the *call* that fails. |
| FE-22 | Pinia is installed before the router. Already correct in all five `main.ts`; re-verify when adding an app, because guards read `authStore`. |
| FE-23 | `GET /auth/me` is the only source of identity, roles, and permissions. Never read authorization from `/profiles/me` — that is the profile page's six-level graph. `localStorage['241_auth_user']` is a per-origin cache, never the session; an app with an empty cache re-derives from the cookie rather than showing a login form (ADR-0010). |

### Routing

| ID | Rule |
|---|---|
| FE-24 | Guards use return-based syntax, never `next()`: `return` to proceed, `return false` to cancel, `return '/x'` or `return { name }` to redirect. Verified against official docs — in Vue Router 5 `next()` raises diagnostic `VUE_ROUTER_R0025` and is removed in v6. The v4 → v5 upgrade itself carried no breaking change for this repo. |
| FE-25 | A guard must exclude its own redirect target. Use `meta.requiresAuth` plus explicit public and guest-only route sets. A signed-in user landing on the login page is sent to the dashboard — one session serves all five apps (ADR-0010). |
| FE-26 | `beforeEnter` does not fire when only params, query, or hash change. Param-based validation belongs in the global `beforeEach` or in `onBeforeRouteUpdate` — never in `beforeEnter` alone. |
| FE-27 | Param changes do not trigger `onMounted`; the component instance is reused. Fetch with `watch(() => route.params.id, fn, { immediate: true })` or `onBeforeRouteUpdate`. `:key="route.fullPath"` only when the component's state genuinely must reset. |
| FE-28 | Filters, search, sort, and pagination belong in the URL query on screens meant to be shared or bookmarked. Modal state, form drafts, and session state stay in the store. This is user-visible behaviour — propose it, do not apply it silently. |

### Performance — only after behaviour is correct

| ID | Rule |
|---|---|
| FE-29 | Virtualize lists beyond ~50–100 rows. Below that, leave them alone. |
| FE-30 | `v-memo` for selection state in long lists, so a selection change re-renders two rows instead of all of them. Never on rows containing `v-model`. |
| FE-31 | Flatten wrappers only on hot paths. shadcn-vue / Reka UI nesting is fine in short or virtualized lists — this is a per-screen decision, not a reason to flatten the shared UI components. |
| FE-32 | Never call an API or mutate state in `onUpdated` — it loops. That hook is for low-level DOM synchronization only. |

---

## Adopted decisions

Every point where a skill and this repo diverged, and what was adopted. Recorded
so the decision is not relitigated — and so it stays visible which items are
deliberate and which are acknowledged debt.

| Skill advised | Adopted instead | Source | Why |
|---|---|---|---|
| Domain events for cross-module communication (DDD, modular-monolith, nestjs-best-practices) | Direct awaited calls; one-way read ports across domains | Repo | ADR-0002 decided it deliberately. Events add infrastructure, async failure modes, and idempotency requirements with no problem demanding them. |
| Module-prefixed entity names (`BillingPlan`); no cross-module `@relation` | `Student`, `User`, `Profile`; cross-domain relations exist | Repo | Single-school deployment on one database. Migration cost far exceeds the isolation benefit the rule targets. |
| NX · Fastify · Biome · tRPC (modular-monolith) | pnpm workspace · Express · ESLint + Prettier · REST + Swagger | Repo | The installed stack works. Boundaries are enforced by sweep specs rather than NX tags — different mechanism, same goal. |
| Cross-module imports *only* through barrels | Barrels forbidden for Module classes and cross-module DTOs | Repo | The barrel re-exports the Module and use cases; a DTO importing it closes an ESM cycle and crashes Nest at boot. The reason is mechanical, not stylistic. |
| `Service` as the application unit | One use case per operation; `services/` for stateless helpers only | Repo | Stricter than the skill. Read its "simple service pattern" as a use case. |
| Never return `null` (clean-code) | `Promise<T \| null>` on repository ports | Repo | Written for a language without nullable types. Under `strictNullChecks`, null in a signature is a compiler-verified contract. |
| DTOs are data classes with no functions | DTOs carry class-validator + Swagger decorators | Repo | The DTO here is the HTTP boundary. The plain structure clean-code means is `*Input`. |
| `shallowRef` for every primitive value | `ref` throughout | Repo | `reactive()` is only applied to object values, so `ref` never proxies a primitive. Zero performance benefit, real consistency cost. |
| Ubiquitous language uses the domain expert's words | Backend in English; the school's experts speak Indonesian | Repo | A deliberate decision with three well-chosen exceptions. The frontend is the translation layer — one accepted permanent translation step. |
| Behaviour-rich entities; invariants inside aggregates | Logic in use cases; "entities" largely Prisma rows | Repo | Holds for existing code. The consequence is honest: two DDD diagnostic rows and one Clean Architecture row do fail. Consider a richer model only when modelling a *new* domain with complex invariants. |
| Router skill written against Vue Router 4 | Vue Router 5.1 installed | Official docs | Checked: v5 has no breaking changes for non-file-based routing. The skill's rules still hold and get stronger — `next()` is removed in v6. |
| A bounded context is a model boundary, not a deployment unit; services are not automatic boundaries | Apps never import each other; `features/lookup` acts as an ACL | Aligned | No conflict. The repo already meets both skills' criteria for a real boundary. |
| Repository port in the domain, implementation in infrastructure, wired via DI | Exactly that | Aligned | DIP applied correctly, with NestJS modules acting as the composition root. |

---

## Skill errata

Factual errors inside the skills themselves. Recorded so their code samples are
not copied verbatim.

- **`vue-pinia-best-practices` → `pinia-no-active-pinia-error.md`** — the router-guard
  "fix" uses `await import(…)` inside a non-`async` arrow function (a syntax error,
  repeated in its `safelyUseStore()` helper). The dynamic import is also unnecessary:
  the actual cause is `useAuthStore()` being called at module level. Call it inside
  the guard body and install Pinia before the router.
- **`vue-router-best-practices` → `router-guard-async-await-pattern.md`** — the example
  labelled "BAD" is correct. An async guard returning `undefined` after a passing check
  is exactly how you proceed, and Vue Router awaits the returned promise. The trailing
  `return true` is harmless but unnecessary.
- **`vue-router-best-practices` → `router-beforerouteenter-no-this.md`** — `to.meta.user = user`
  mutates the route record's shared meta object, so one user's data can surface on a later
  navigation. Use a store or an id-keyed cache instead.
- **`nestjs-best-practices` and `nestjs-modular-monolith`** — every database example is
  TypeORM (`@Entity`, `DataSource.transaction`, `synchronize: true`, `createQueryBuilder`).
  None applies here. Take the principles (transactions, N+1, migrations, narrow selects)
  and drop the syntax.

---

## Done checklist

**Backend**

- [ ] Controller thin; no Prisma outside `infrastructure/persistence/`
- [ ] Use case is one operation, within budget, no inline types or constants
- [ ] DTO mapped to Input field by field
- [ ] Every read touching a user uses the correct narrow select
- [ ] Queries scoped by `deletedAt: null` + period
- [ ] Routes carry `@RequirePermissions`; `/me` routes have their own permission
- [ ] NestJS exceptions, not bare `Error`
- [ ] No Module class or cross-module DTO imported through a barrel
- [ ] All new text in English
- [ ] Architectural sweep specs still green

**Frontend**

- [ ] Imports only through public aliases; no app reaches into another
- [ ] Components split per the triggers; route views stay thin
- [ ] Derivations in script, stable `v-for` keys, no raw `v-html`
- [ ] Props/emits/slots typed; `defineModel` for v-model
- [ ] Reference lists left to Vue Query, not mirrored into Pinia
- [ ] Setup store returns all state; `storeToRefs` used correctly
- [ ] No `useXxxStore()` at module level
- [ ] Guards return-based and exclude their own target
- [ ] Param-dependent data fetched via `watch` / `onBeforeRouteUpdate`
- [ ] Performance work applied only after behaviour is verified

**Commands**

```bash
pnpm --filter backend validate          # backend owns its tooling
pnpm --filter academic-web validate     # one frontend app
pnpm lint && pnpm typecheck && pnpm lint:strict && pnpm test && pnpm build
```

Root scripts filter by package **name**, not path — pnpm's path filter is
case-sensitive against cwd casing, so on Windows a path filter can silently
match nothing. `pnpm test` is the one root script that also covers `@241/*`,
and it deliberately excludes the backend.

**Nothing reaches `main` that has not already run on `dev`.** A merge to `main`
deploys to the school within minutes. The order is always: work → `dev` →
verified on development → PR `dev`→`main`. The promotion guard and the pre-push
hook are reminders, not enforcement — the rule is what binds.
