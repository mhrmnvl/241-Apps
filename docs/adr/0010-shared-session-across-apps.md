# One session across all five apps, and one endpoint that defines it

**Context**: [ADR-0009](0009-presence-web-fifth-app.md) split presence and payroll into a fifth frontend and recorded, as its main cost, that "sessions are per-origin" so an operator of two apps signs in twice. That was wrong, and the correction is worth more than the original claim.

The refresh cookie is set by the **backend**, on the API host:

```ts
// backend/src/platform/auth/presentation/auth.controller.ts
res.cookie(REFRESH_TOKEN_COOKIE, token, {
  httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/auth', maxAge,
})
```

With no `domain` attribute it is a host-only cookie for the API, and every frontend calls that API with `withCredentials: true`. The session was therefore already shared before this ADR; nothing about the split changed it.

What is per-origin is `localStorage`, which holds a *cache* of the signed-in user. The route guard read that cache — not the token — to decide whether anyone was signed in, so a person with a live session opening a second app was shown a login form while holding a perfectly valid cookie. The bug was in what the guard trusted, not in the session.

**Decision**: one session for all apps, with two rules that keep it honest.

1. **The cookie is the session; `localStorage` is a per-origin cache of the identity, nothing more.** On startup `authService.restoreSession()` mints an access token from the cookie and, when this origin's cache is empty, fills it by asking who the token belongs to. An app never asks a signed-in person to authenticate again.

2. **`GET /auth/me` is the only answer to "who is signed in".** It returns identity, roles, and permissions and nothing else. Both entry points — signing in, and restoring a session another app opened — go through `authIdentityService.fetchIdentity()`, so the two cannot disagree about what a user may do.

**Login pages stay per app.** With a shared cookie, per-app login pages *are* single sign-on: whichever app a person authenticates through sets the cookie for all of them, and the others never render their login page. A central login host would add a redirect round-trip, an open-redirect parameter to validate, and a deploy target — to replace something that already works.

## Why `/auth/me` and not `/profiles/me`

Permissions used to be read from `/profiles/me` via `enrichUserWithProfile`, which is why login worked at all. That endpoint answers with the profile page's graph: social media, achievements, scholarships, educational histories, religion, blood type, avatar file, the teacher's addresses and positions and teaching assignments, the student's enrolments, their classroom, its grade, its supervisors, and each supervisor's own user and profile. Six levels deep.

Two reasons to move off it, neither of them about correctness today:

- **Weight.** It is loaded before the router can resolve a single route, in five apps, on every cold start — to obtain an array of permission strings.
- **Ownership.** Session bootstrap should not depend on an endpoint whose include graph is edited for unrelated reasons. Someone adding a relation to the profile page should not be able to slow down, or break, every app's ability to sign a user in.

`/profiles/me` keeps its job. The app shell still calls `syncAuthenticatedUserProfile` after mount, which is where the avatar and email come from — display data, fetched where it is displayed.

## Considered Options

- **Leave the guard reading `localStorage` and accept the second login** — rejected. It is not a security boundary: both prompts accept the same password and yield the same permissions. It is friction wearing a boundary's clothes, and it would have been recorded in the thesis as a design choice rather than the accident it was.
- **A central login host (`auth.mts241alikhlash.sch.id`)** — rejected, see above. This is the option to revisit if the school ever adds an identity provider it does not own; at that point the redirect is unavoidable and buys something.
- **Add `permissions` to the login and refresh responses instead of reading `/auth/me`** — rejected. It puts the same data in three places and still leaves refresh unable to answer for an origin that never saw the login. One endpoint, one shape.
- **Share `localStorage` across apps** — impossible by design, and the wrong instinct: the cure is to stop treating a cache as the source of truth.

## Consequences

- **Every frontend must share a registrable domain with the API.** `sameSite: 'strict'` means the cookie is withheld on a cross-site request, so `presensi.mts241alikhlash.sch.id` → `api.mts241alikhlash.sch.id` works while `presensi.vercel.app` → `api.mts241alikhlash.sch.id` does not. On a foreign domain the failure is not "no SSO" but **no login at all**, and it will not reproduce in development, where every app is `localhost` and ports are not part of a site. This is now a deployment constraint, recorded in each app's `.env.example`.
- **Signing out signs out everywhere**, which follows from one session and is the behaviour a shared session should have. `logout` clears the cookie at the API; other tabs discover it on their next refresh.
- **The persisted-user key is `241_auth_user`**, renamed from `siakad_user` once four other apps were writing it, and declared once in `@241/shared` rather than separately in shared and platform. Nothing migrates the old key: the cookie refills it on first load, which is the same mechanism this ADR is about.
- **A token whose identity cannot be read is discarded.** `restoreSession` clears rather than keeps it — a session no guard can evaluate is worse than none, because it bounces between dashboard and login.
- **The account's login page is whichever app they opened.** Branding stays per app through `configureAuth()`, so a teacher who lands on SIPRES sees "Masuk ke SIPRES" and arrives in SIPRES.
