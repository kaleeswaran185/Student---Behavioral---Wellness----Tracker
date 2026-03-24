# V1 Scope

This file defines the production scope for the first deployable version of the
Student Behavioral Wellness Tracker.

## In Scope

- Student login
- Teacher login
- Student check-ins
- Student journal entries
- Student SOS alerts
- Teacher student list
- Teacher student profile updates
- Teacher and student messaging
- WellnessBuddy AI chat

## Out Of Scope For Initial Deployment

- Demo-only sample data in production
- Teacher self-registration from the public sign-up form
- Advanced analytics beyond the current dashboard summaries
- Non-persistent alert or message storage
- Experimental helper scripts that are not part of the runtime

## Demo Mode

- Demo data is available only when `VITE_DEMO_MODE=true`.
- Production and staging environments should keep demo mode disabled.
