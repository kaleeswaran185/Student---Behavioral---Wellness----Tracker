# Viva Guide

## 1. Why this project?

- It addresses a real school wellness monitoring problem.
- It combines student self-reporting with teacher visibility and intervention.
- It is small enough to explain clearly, but rich enough to demonstrate full-stack skills.

## 2. Why MERN?

- One language across frontend and backend
- Flexible document database for event-like wellness data
- Fast UI iteration with reusable React components
- Straightforward REST API with Express

## 3. Core flows to explain

- Student login and mood check-in
- Student journal creation
- SOS alert propagation
- Teacher dashboard and student management
- Teacher-student messaging
- AI wellness assistant request flow

## 4. Security points to mention

- JWT-based authentication
- role-based access control
- request validation with `express-validator`
- Helmet headers and CORS policy
- rate limiting on AI requests

## 5. Database points to mention

- `User` stores profile-level data and embedded staff history
- `CheckIn` and `Journal` are separate collections for timeline scaling
- `Alert` supports urgency workflows
- `Message` stores conversation records
- indexes improve sorted reads

## 6. Testing points to mention

- backend integration tests run with in-memory MongoDB
- frontend tests cover utility and achievement logic
- one command verifies lint, tests, and build

## 7. Honest limitation to mention

- the repo is deployment-ready, but the final live public URL still depends on
  access to Render/Vercel or another hosting account
