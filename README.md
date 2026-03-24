# Student Behavioral Wellness Tracker

Student Behavioral Wellness Tracker is a school wellness platform with separate
student and teacher experiences.

- Students can log in, submit daily mood check-ins, write journal entries, send
  SOS alerts, and chat with WellnessBuddy.
- Teachers can monitor students, review alerts, update risk and status details,
  and communicate with students.

## Current Stack

- Frontend: React 19, Vite 7, Tailwind CSS 4, Framer Motion, Recharts, Sonner
- Backend: Node.js, Express 5, JWT auth, Helmet, CORS, rate limiting
- Database: MongoDB with Mongoose
- AI: Groq chat completions for WellnessBuddy

## Repository Layout

- `client/` - React frontend
- `backend/` - Express API and MongoDB models
- `docs/V1_SCOPE.md` - deployment-focused scope freeze for v1

## Local Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

Copy the example file and fill in your real values:

```bash
copy backend\\.env.example backend\\.env
```

Optional frontend demo flag:

```bash
copy client\\.env.example client\\.env
```

`VITE_DEMO_MODE=false` keeps the UI in deployment-safe mode.

### 3. Start the app

```bash
npm start
```

- Frontend dev server: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Available Scripts

### Root

- `npm start` - runs frontend and backend together
- `npm run install:all` - installs root, client, and backend dependencies
- `npm run lint` - runs frontend lint checks
- `npm run test` - runs backend API tests
- `npm run build` - builds the frontend for production
- `npm run verify` - runs lint, backend tests, and frontend build

### Client

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

### Backend

- `npm start`
- `npm run dev`

## Deployment Notes

- Keep `VITE_DEMO_MODE=false` in staging and production.
- Do not commit `.env` files or real API keys.
- Teacher accounts should be provisioned separately from public student signup.
- Set `VITE_API_BASE_URL` when the frontend is deployed separately from the
  backend. Leave it blank in local dev to use the Vite proxy.
- `CLIENT_ORIGIN` should match your deployed frontend origin. You can provide
  multiple allowed origins as a comma-separated list.
- `BODY_LIMIT` and `LOG_LEVEL` are now configurable in the backend env.

## CI/CD

- GitHub Actions verification is defined in `.github/workflows/ci.yml`
- `staging` is intended for pre-production verification
- `main` is intended for production-ready changes
- Direct pushes to protected branches should require the `CI / Verify` check
- Full setup notes are in `docs/CI_CD.md`

## Testing

- Full testing documentation is in `docs/TESTING.md`
- Main validation command: `npm run verify`
- Staging smoke test command: `npm run smoke:staging`

## Staging Rollout

- Staging deployment assets are included for Docker-based rollout
- Use `docker-compose.staging.yml` for a local staging simulation
- Seed staging data with `npm run seed:staging`
- Run the hosted smoke test with `npm run smoke:staging`
- Full staging instructions are in `docs/STAGING_DEPLOY.md`

## Environment Reference

### Backend `.env`

- `NODE_ENV` - `development`, `test`, or `production`
- `PORT` - API port, defaults to `5000`
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - signing secret for auth tokens
- `GROQ_API_KEY` - WellnessBuddy model access
- `CLIENT_ORIGIN` - allowed browser origin(s), comma-separated if needed
- `BODY_LIMIT` - Express JSON/urlencoded payload limit
- `LOG_LEVEL` - `error`, `warn`, `info`, or `debug`

### Client `.env`

- `VITE_DEMO_MODE` - enables demo-only fallback data when `true`
- `VITE_API_BASE_URL` - full backend base URL for split deployments
- `VITE_API_PROXY_TARGET` - local dev proxy target for Vite when
  `VITE_API_BASE_URL` is empty

## Current Verification Snapshot

- Root lint passes.
- Backend tests pass.
- Frontend production build succeeds.
- The local git repository is connected to the GitHub repo:
  `kaleeswaran185/Student---Behavioral---Wellness----Tracker`
