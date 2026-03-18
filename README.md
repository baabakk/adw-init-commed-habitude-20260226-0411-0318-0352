# Habitude (init-commed-habitude-20260226-0411)

Habitude is a full-stack habit tracking application with:
- Habit CRUD and completion tracking
- Event-driven streak updates via `HabitCompleted` events
- Reminder scheduling and delivery through adapter-based SMS, Telegram, and WhatsApp integrations
- Progress chart data API and React frontend visualization
- JWT-protected REST APIs
- PostgreSQL as the source of truth

## Tech Stack
- Backend: Node.js, Express, TypeScript, TypeORM, PostgreSQL
- Frontend: React + TypeScript

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   - `PORT` (default: 4000)
   - `JWT_SECRET`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
3. Run in development:
   ```bash
   npm run dev
   ```
4. Build:
   ```bash
   npm run build
   ```

## API Overview
All API routes require `Authorization: Bearer <jwt>`.

- `GET /api/habits` - list habits
- `POST /api/habits` - create habit
- `PUT /api/habits/:id` - update habit
- `DELETE /api/habits/:id` - delete habit
- `POST /api/habits/:id/complete` - mark habit complete (emits `HabitCompleted`)
- `POST /api/reminders` - create reminder
- `GET /api/reminders` - list reminders
- `POST /api/reminders/:id/send-test` - send test reminder
- `GET /api/progress/:habitId?days=30` - progress chart data

## Architecture Notes
- ADR-001: REST APIs are used for all service communication.
- ADR-002: Streak updates are event-driven in `streakService` via internal event bus.
- ADR-003: Messaging integrations are isolated in adapter classes and use retry logic.
- ADR-004: PostgreSQL (via TypeORM) stores all core entities.

## Frontend
Frontend source is in `frontend/` and consumes backend API contracts through `frontend/utils/apiClient.ts`.
