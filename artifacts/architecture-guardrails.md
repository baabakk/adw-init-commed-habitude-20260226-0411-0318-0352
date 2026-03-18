# Architecture Guardrails: init-commed-habitude-20260226-0411

> Generated at 2026-03-18T01:54:04.953Z
> Source: Claude-enhanced
> Derived from: tpm-contract.json

## Interfaces

### Habit CRUD API (api)

RESTful interface for creating, reading, updating, and deleting user habits

**Contract:** Supports POST /habits, GET /habits/{id}, PUT /habits/{id}, DELETE /habits/{id}; requires user authentication; returns habit details including name, schedule, and completion status

### Reminder Scheduler (api)

Service to register, update, and cancel scheduled reminders based on user-defined times

**Contract:** Accepts habit ID, user ID, and schedule (cron-like); triggers Reminder Delivery Service at scheduled time; handles timezone-aware scheduling

### Reminder Delivery Service (api)

Orchestrates delivery of reminders via configured messaging platforms

**Contract:** Receives trigger from Reminder Scheduler; routes message to SMS, Telegram, or WhatsApp based on user preference; implements retry logic on failure

### Messaging Platform Adapters (api)

Wrapper services for external messaging APIs (SMS, Telegram, WhatsApp)

**Contract:** Abstracts vendor-specific APIs; standardizes message format and error handling; enforces rate limit compliance

### Progress Chart Data API (api)

Provides time-series habit completion data for chart rendering

**Contract:** GET /habits/{id}/progress?range=30d; returns daily completion status; supports aggregation by week/month

### Streak Calculation Engine (event)

Listens to habit completion events and computes current streaks

**Contract:** Consumes 'HabitCompleted' event; updates streak count; emits 'StreakUpdated' and 'StreakThresholdReached' events

### User Authentication Service (api)

Handles user login, session management, and identity verification

**Contract:** OAuth2 or JWT-based; integrates with frontend and all backend services

### Frontend Web Application (shared-lib)

UI components and state management for habit tracking

**Contract:** React-based; consumes Habit CRUD API, Progress Chart Data API, and Streak Calculation Engine outputs

## Data Contracts

### Habit

- **Storage:** PostgreSQL
- **Ownership:** Habit Management Service
- **Notes:** Includes name, description, reminder schedule, creation date, and associated goal (optional)

### User

- **Storage:** PostgreSQL
- **Ownership:** User Management Service
- **Notes:** Stores user ID, authentication tokens, preferred messaging channels, and contact identifiers (phone, Telegram ID, WhatsApp number)

### HabitCompletion

- **Storage:** PostgreSQL
- **Ownership:** Habit Tracking Service
- **Notes:** Daily record of whether a habit was completed; used for progress charts and streak calculation

### ReminderSchedule

- **Storage:** PostgreSQL
- **Ownership:** Reminder Scheduler
- **Notes:** Maps habits to delivery times and channels; supports recurring schedules

### Streak

- **Storage:** PostgreSQL
- **Ownership:** Streak Calculation Engine
- **Notes:** Tracks current consecutive days of habit completion; resets on missed day

### MessagingEventLog

- **Storage:** PostgreSQL
- **Ownership:** Reminder Delivery Service
- **Notes:** Logs all reminder delivery attempts, successes, failures; used for monitoring and retry

## Scalability

**Expected Load:** 10K concurrent users, 100K daily active users, average 3 habits per user, peak reminder bursts at 8-9 AM and 6-7 PM

**Bottlenecks:**
- Messaging platform API rate limits during peak hours
- Streak recalculation under high write load
- Chart data queries over large date ranges
- Reminder delivery orchestration at scale

**Mitigations:**
- Implement message queuing (e.g., SQS) for reminder delivery with backpressure
- Use caching (Redis) for streak and progress data
- Paginate and pre-aggregate chart data
- Distribute scheduling with worker pools and time-sharded jobs

## Security Baseline

- **Auth Method:** JWT with refresh tokens, secured over HTTPS
- **Data Classification:** PII (phone numbers, messaging IDs), user behavior data (habit completions)

**Threat Vectors:**
- Unauthorized access to habit and streak data
- Credential leakage in messaging integrations
- SMS spoofing or phishing via reminder messages
- Rate limiting abuse on public endpoints
- Data exfiltration via insecure chart data API

**Mitigations:**
- Encrypt PII at rest and in transit
- Rotate API keys for external messaging services
- Validate and sanitize all user inputs
- Enforce strict CORS and rate limiting on APIs
- Audit log all data access and modification

## Architecture Decision Records

### ADR-001: Adopt RESTful APIs for internal service communication

**Status:** accepted

**Context:** FR-01, FR-02, FR-08 require reliable CRUD operations; NFR-04 requires web accessibility; internal dependencies include multiple services needing interoperability

**Decision:** Use REST over HTTP with JSON payloads for all internal service APIs

**Consequences:** Simplifies frontend integration and debugging; may require additional effort to enforce consistency across services

### ADR-002: Implement event-driven streak calculation

**Status:** accepted

**Context:** FR-04 and FR-10 require real-time streak updates; AC-04 and AC-05 demand immediate feedback on habit completion

**Decision:** Use event sourcing pattern: emit 'HabitCompleted' event on completion; consume by Streak Calculation Engine

**Consequences:** Enables reliable streak tracking and notifications; adds complexity with message broker dependency

### ADR-003: Abstract external messaging APIs behind adapter layer

**Status:** accepted

**Context:** FR-05, FR-06, FR-07 and NFR-01 require reliable delivery across SMS, Telegram, WhatsApp; externalDependencies list high-risk integrations with rate limits

**Decision:** Build adapter services per platform to normalize message sending, error handling, and retry logic

**Consequences:** Improves resilience and testability; increases operational overhead for monitoring each adapter

### ADR-004: Use PostgreSQL as single source of truth for core entities

**Status:** accepted

**Context:** FR-01, FR-02, FR-08 require durable storage; internalDependencies include data storage and retrieval needs

**Decision:** Store Habit, User, HabitCompletion, Streak, and ReminderSchedule in PostgreSQL with proper indexing

**Consequences:** Ensures ACID compliance and referential integrity; may require read replicas for scaling analytics queries

## Confidence & Gaps

**Confidence:**
- interfaces: *inferred*
- dataContracts: *inferred*
- scalability: *assumed*
- securityBaseline: *inferred*
- adrs: *inferred*

**Gaps:**
- No user authentication requirements specified in contract
- Lack of defined data retention policies
- No explicit performance SLAs for API response times
- Missing compliance requirements (e.g., GDPR, TCPA for SMS)
- No disaster recovery or backup strategy documented
- Undefined fallback behavior for failed message deliveries
- No internationalization or timezone handling details
- Unspecified cost constraints for external API usage
