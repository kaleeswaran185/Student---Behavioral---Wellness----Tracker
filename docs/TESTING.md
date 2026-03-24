# Testing Guide

This project currently uses a mix of automated checks and manual flow testing.

## Test Layers

### 1. Frontend Linting

Linting is used as the main frontend quality gate.

Run from the repo root:

```bash
npm run lint
```

What it checks:

- React hook usage
- unused variables/imports
- general frontend code quality issues

### 2. Backend Integration Tests

The backend test suite uses:

- Node test runner
- `supertest`
- `mongodb-memory-server`

Run from the repo root:

```bash
npm run test
```

Or directly inside `backend/`:

```bash
npm test
```

The automated backend tests currently cover:

- student register and login
- teacher create and list students
- student history create, list, and delete
- student SOS alert creation and teacher read flow
- teacher and student messaging

Test file:

- `backend/test/api.test.js`

### 3. Full Repository Verification

The main project-level verification command is:

```bash
npm run verify
```

This runs:

1. frontend lint
2. backend integration tests
3. frontend production build

Use this before:

- pushing code
- opening a pull request
- preparing a staging or production release

## Local Manual Testing

### Start The App

From the repo root:

```bash
npm start
```

Local URLs:

- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`
- backend health: `http://localhost:5000/health`

### Seed Test Accounts

From the repo root:

```bash
npm run seed:staging
```

Or directly:

```bash
cd backend
npm run seed
```

Common seeded accounts:

- Teacher: `teacher@school.com` / `password123`
- Student: `alice@school.com` / `password123`

### Recommended Local Manual Checklist

Student flow:

1. Log in as a student
2. Submit a mood check-in
3. Save a journal entry
4. Open WellnessBuddy
5. Send a teacher message
6. Trigger SOS

Teacher flow:

1. Log in as a teacher
2. Open the student directory
3. Add a student
4. View alerts
5. Mark an alert as read
6. Open a student conversation

## Staging Smoke Testing

For staging, use the smoke script:

```bash
npm run smoke:staging
```

Required environment variable:

- `STAGING_API_URL`

Optional environment variables:

- `STAGING_WEB_URL`
- `STAGING_TEACHER_EMAIL`
- `STAGING_TEACHER_PASSWORD`
- `STAGING_STUDENT_EMAIL`
- `STAGING_STUDENT_PASSWORD`

Example:

```bash
set STAGING_API_URL=https://your-staging-api
set STAGING_WEB_URL=https://your-staging-frontend
set STAGING_TEACHER_EMAIL=teacher@school.com
set STAGING_TEACHER_PASSWORD=password123
set STAGING_STUDENT_EMAIL=alice@school.com
set STAGING_STUDENT_PASSWORD=password123
npm run smoke:staging
```

The staging smoke script performs real write operations:

- teacher login
- student login
- student check-in
- history fetch
- SOS alert creation
- alert read flow
- teacher/student messaging

See also:

- `docs/STAGING_DEPLOY.md`

## CI Testing

GitHub Actions runs the verification workflow defined in:

- `.github/workflows/ci.yml`

It runs on:

- pushes to `main`
- pushes to `staging`
- pull requests targeting `main`
- pull requests targeting `staging`

## Troubleshooting

### Backend tests fail locally

Check:

- `backend/node_modules` are installed
- no local process is interfering with MongoDB ports
- Node version is compatible with current dependencies

### Login works but app data is missing

Check:

- `MONGO_URI` is set correctly
- backend server is running
- `/health` reports the database as `connected`

### Staging smoke test fails

Check:

- the staging API URL is correct
- seeded teacher and student accounts exist
- frontend and backend origins match
- `CLIENT_ORIGIN` and `VITE_API_BASE_URL` are correctly configured

## Current Testing Scope

The project now has:

- frontend linting
- backend integration tests
- repo-level verification
- staging smoke testing

What is still light:

- frontend component/unit tests
- browser-based end-to-end UI automation
- performance/load testing
- security-specific automated testing
