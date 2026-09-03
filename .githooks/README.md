# .githooks

Repo-tracked Git hooks for this project.

## Enable them

Hooks in this directory are **opt-in per clone**. Run once after cloning:

```sh
git config core.hooksPath .githooks
```

From then on Git uses `.githooks/` instead of `.git/hooks/`.

## Hooks

### `pre-push`

Rejects direct pushes (and deletions) of the three long-lived branches:

- `main` — production. Reflects the exact live code.
- `staging` — pre-production. QA testing and final reviews.
- `develop` — integration. Where completed features land.

All changes to these branches go through a pull request:

```
feature/*  ->  develop  ->  staging  ->  main (prod)
```

This is a **local convenience guard only**. It is not server-enforced and
can be bypassed with `git push --no-verify`. The authoritative rules are
GitHub branch protection on `main`, `staging` and `develop`.
