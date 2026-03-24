# Staging Deployment

Phase 10 prepares this repo for a repeatable staging rollout.

## Included Assets

- `docker-compose.staging.yml`
- `backend/Dockerfile`
- `client/Dockerfile`
- `client/nginx.conf`
- `backend/.env.staging.example`
- `client/.env.staging.example`
- `scripts/staging-smoke.mjs`

## Staging Goals

- Deploy the backend with production-style env vars
- Deploy the frontend with `VITE_DEMO_MODE=false`
- Connect to a dedicated staging MongoDB database
- Seed the database with known teacher and student accounts
- Run a real smoke test against the hosted staging URLs

## Seeded Accounts

The existing seed script creates predictable accounts including:

- Teacher: `teacher@school.com` / `password123`
- Student: `alice@school.com` / `password123`

Before smoke testing staging, run the seed script against the staging database.

## Option A: Local Staging Simulation With Docker

1. Copy `backend/.env.staging.example` to `backend/.env.staging`
2. Update `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, and `CLIENT_ORIGIN`
3. Set `STAGING_API_PUBLIC_URL` if the frontend should talk to a non-local backend URL
4. Start the stack:

```bash
docker compose -f docker-compose.staging.yml up --build
```

5. Seed data:

```bash
cd backend && node seed.js
```

6. Run smoke checks:

```bash
set STAGING_API_URL=http://localhost:5000
set STAGING_WEB_URL=http://localhost:8080
node scripts/staging-smoke.mjs
```

## Option B: Hosted Staging Rollout

1. Provision a staging MongoDB database
2. Deploy the backend from `backend/` using the provided `Dockerfile`
3. Deploy the frontend from `client/` using the provided `Dockerfile`
4. Set frontend build args:
   - `VITE_DEMO_MODE=false`
   - `VITE_API_BASE_URL=https://your-staging-api`
5. Set backend env vars:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
   - `GROQ_API_KEY=...`
   - `CLIENT_ORIGIN=https://your-staging-frontend`
   - `BODY_LIMIT=1mb`
   - `LOG_LEVEL=info`
6. Seed the staging database
7. Run the smoke test against the hosted URLs

## Smoke Test Command

```bash
set STAGING_API_URL=https://your-staging-api
set STAGING_WEB_URL=https://your-staging-frontend
set STAGING_TEACHER_EMAIL=teacher@school.com
set STAGING_TEACHER_PASSWORD=password123
set STAGING_STUDENT_EMAIL=alice@school.com
set STAGING_STUDENT_PASSWORD=password123
node scripts/staging-smoke.mjs
```

## Smoke Checklist

The smoke script validates:

- frontend root responds
- API `/health` responds
- teacher login works
- student login works
- student history create/list works
- SOS alert create/read works
- teacher/student messaging works

## Notes

- The smoke test performs real writes in staging by design
- Keep staging data isolated from production
- Phase 11 should connect this staging process to the final production rollout path
