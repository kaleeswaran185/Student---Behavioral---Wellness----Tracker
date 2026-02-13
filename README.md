# Student Behavioral Wellness Tracker MVP

A responsive web app for schools to track student mood trends and identify behavioral risks early.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, ShadCN UI
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Mocked for MVP portability)

## Prerequisites
- Node.js (v14+ recommended)
- npm

## Setup & Running

### Simplified Setup (Recommended)
1. Navigate to the root directory:
   ```bash
   cd "Student Behavioral Wellness Tracker"
   ```
2. Install all dependencies:
   ```bash
   npm run install:all
   ```
3. Start the application (both client and server):
   ```bash
   npm start
   ```

### Manual Setup
#### 1. Client (Frontend)
Navigate to the `client` directory and install dependencies:
```bash
cd client
npm install
```
Start the development server:
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

#### 2. Server (Backend)
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```
Start the backend server:
```bash
npm run dev
```
The server runs on `http://localhost:5000`.

## Features
- **Student View:**
  - Login Page (Mock roles: 'student', 'teacher')
  - Daily Check-in with Emoji selector
  - Journaling
  - SOS/Help Button (Mock alert)
  - "WellnessBuddy" AI Chat (Mock response)
- **Teacher Dashboard:**
  - Student Status Table
  - Mood Heatmap Visualization

## Notes
- The database is currently mocked in-memory within `server/index.js` for easy local testing without setting up a PostgreSQL instance.
- To enable real PostgreSQL, update `server/index.js` to use the `pg` client and configure `.env` variables.
