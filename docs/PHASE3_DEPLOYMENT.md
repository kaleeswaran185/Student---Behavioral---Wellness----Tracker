# Phase 3: Deployment and Production Readiness

This repo now includes deployment-ready configuration for hosted rollout.

## Added assets

- `render.yaml`
- `client/vercel.json`
- `.github/workflows/deploy_staging.yml`
- `.github/workflows/deploy_production.yml`
- `docs/openapi.yaml`

## Recommended hosting split

- Backend: Render web service using `backend/Dockerfile`
- Frontend: Vercel static deployment from `client/`

## CI/CD trigger model

- Push to `staging` triggers staging deploy hooks
- Push to `main` triggers production deploy hooks
- GitHub secrets required:
  - `STAGING_BACKEND_DEPLOY_HOOK`
  - `STAGING_FRONTEND_DEPLOY_HOOK`
  - `PRODUCTION_BACKEND_DEPLOY_HOOK`
  - `PRODUCTION_FRONTEND_DEPLOY_HOOK`

## Remaining external step

The repository is now deployment-ready, but the final live URL still requires:

1. Creating the hosting services
2. Setting real secrets in the hosting platform
3. Adding GitHub deploy hook secrets
4. Running the first successful hosted deployment

That last step cannot be completed from the local repo alone without access to
the target hosting accounts.
