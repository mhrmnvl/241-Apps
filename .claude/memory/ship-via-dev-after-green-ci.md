---
name: ship-via-dev-after-green-ci
description: "How the user wants work shipped — commit, PR to dev, wait for green CI, then merge; never straight to main"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1d9be3a4-59e3-4a45-b789-dd476f3c8521
  modified: 2026-08-21T13:03:26.479Z
---

The user's standard instruction for finishing a piece of work is: commit
everything, open a PR against `dev`, **wait for CI to go green**, then merge —
and afterwards check out `dev`, pull, and delete the leftover branch. They have
asked for this in the same words several times ("Iya, tunggu CI hijau terus
merge ke dev"), so offer the whole sequence rather than stopping at the PR.

**Why:** a merge to `main` deploys to the school within minutes, so `main` is
not a place to try something. `dev` deploys to the development VPS first, which
is where a change is actually verified. The promotion guard and the pre-push
hook are advisory only — branch protection needs GitHub Pro on a private repo,
which this account does not have — so the discipline is the real mechanism, not
the automation.

**How to apply:** run the app's `validate` script before committing (it catches
what plain `lint` does not); target the PR at `dev`; if a base branch may be
deleted by another merge, retarget dependent PRs to `dev` *before* merging, or
GitHub auto-closes them and refuses to reopen. Do not merge on a red or missing
check — CI only triggers for PRs whose base is `dev`.

Related: [[validate-against-external-sources]]
