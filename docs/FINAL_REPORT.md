# Final Project Report

## Project Title

Student Behavioral Wellness Tracker

## Problem Statement

Schools need a lightweight system to monitor student wellness signals, support
timely intervention, and maintain communication between students and staff.

## Proposed Solution

This project provides:

- student login and self-tracking
- mood check-ins and journaling
- SOS emergency alerts
- teacher-side monitoring dashboard
- teacher-student messaging
- an AI-powered wellness support assistant

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts, Sonner
- Backend: Node.js, Express, JWT, Helmet, CORS, express-validator
- Database: MongoDB with Mongoose
- Deployment-ready assets: Docker, Render config, Vercel config, GitHub Actions

## Implemented Features

- role-based login for student and teacher flows
- full student management CRUD
- combined mood and journal timeline
- SOS alert creation and acknowledgement flow
- live teacher-student messaging
- AI wellness assistant with guarded prompt flow
- validation, auth, and security middleware
- backend integration tests and frontend utility tests
- production build and CI verification

## Performance Notes

- top-level route chunks already existed through React lazy loading
- Phase 3 adds lazy-loading for heavy teacher subviews to reduce initial bundle cost
- MongoDB indexes support frequent reads on history, alerts, and messages

## Testing Summary

- Backend integration tests: auth, CRUD, alerts, messages
- Frontend tests: utility and gamification condition checks
- Repo verification: lint, backend tests, frontend tests, production build

## Documentation Pack

- Architecture: `docs/PHASE1_ARCHITECTURE.md`
- ERD: `docs/PHASE1_ERD.md`
- Wireframes: `docs/PHASE1_WIREFRAMES.md`
- API Testing: `docs/PHASE2_API_TESTING.md`
- OpenAPI: `docs/openapi.yaml`
- Deployment: `docs/PHASE3_DEPLOYMENT.md`

## Conclusion

The repository now covers the major academic deliverables for Phase 1 through
Phase 3. The only remaining external completion item is publishing to live
hosting and attaching the final public URLs.
