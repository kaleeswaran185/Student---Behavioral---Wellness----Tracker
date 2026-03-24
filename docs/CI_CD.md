# CI/CD Workflow

This repo now includes GitHub Actions automation in
`.github/workflows/ci.yml`.

## What The Workflow Does

- Runs on push to `main` and `staging`
- Runs on pull requests targeting `main` and `staging`
- Supports manual execution with `workflow_dispatch`
- Executes the full repo verification command:
  - frontend lint
  - backend API tests
  - frontend production build
- Produces release artifacts on direct pushes to:
  - `staging` -> `staging` environment
  - `main` -> `production` environment

## Branch Strategy

- `staging` is the pre-production branch
- `main` is the production branch

Recommended flow:

1. Feature branch -> pull request into `staging`
2. Validate on staging
3. Pull request or fast-forward merge from `staging` into `main`

## Required GitHub Settings

These settings must be configured in GitHub and cannot be fully enforced only by files in the repo:

1. Create a `staging` branch in GitHub
2. Add branch protection for `staging`
3. Add branch protection for `main`
4. Require the `CI / Verify` status check before merge
5. Restrict direct pushes to `main` if your team workflow needs it
6. Create GitHub environments named `staging` and `production`
7. Add required reviewers to `production` if you want manual approval before release

## Secret Handling

- Keep runtime secrets in the deployment platform secret manager
- Do not store real secrets in the repo
- Do not commit `.env` files
- If GitHub environment secrets are used, prefer them only for CI metadata or deployment handoff, not as the long-term source of truth for app runtime secrets

## Current Scope

Phase 9 prepares CI/CD gates and release artifacts.

Actual staging and production deployment wiring should be added in:

- Phase 10: staging deployment
- Phase 11: production deployment
