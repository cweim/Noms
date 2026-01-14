# Noms Backend

FastAPI backend API server for the Noms food discovery app.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server with hot reload
- **Pydantic** - Data validation and settings management
- **PostgreSQL** - Database (configured in Phase 2)

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
```

### 2. Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values (most will be configured in later phases).

## Database Setup

### Apply Migrations

**Option 1: Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20260113000001_create_core_schema.sql`
3. Paste and run

**Option 2: Python Script**
```bash
cd backend
source venv/bin/activate
python supabase/apply_migration.py
```

### User Profile Trigger (Phase 4)

The trigger migration `20260114000001_add_user_trigger.sql` must be applied after the core schema. This creates user profiles automatically when users sign up via Supabase Auth.

**Apply via Supabase Dashboard:**
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/20260114000001_add_user_trigger.sql`
3. Run the SQL

**Verify trigger exists:**
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'auth' AND event_object_table = 'users';
```

Expected: `on_auth_user_created`

### Verify Schema

Check tables created:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected tables: users, places, lists, saved_places, journal_entries

### Performance Optimization

Indexes have been added for common query patterns:
- User's saved places and journal entries
- Place lookups by Google Place ID
- Chronological journal ordering

The `users.updated_at` field is automatically maintained via trigger.

## Security

Row Level Security (RLS) is enabled on all tables:

- **users**: Users can only read/update their own profile
- **places**: Authenticated users can read (public cached data from Google)
- **lists**: Users can only manage their own lists
- **saved_places**: Users can only access their own saves
- **journal_entries**: Users can only access their own journal

All queries automatically enforce these policies via Supabase Auth.

## API Structure

### Router Organization

The API is organized using FastAPI routers by feature:

- **`/api/auth`** - Authentication endpoints (Phase 4)
  - User signup, login, logout
  - Password reset, email verification

- **`/api/places`** - Google Places integration (Phase 5)
  - Search places near location
  - Get place details
  - Cache place data

- **`/api/users`** - User data endpoints (Phases 9-11)
  - Saved places and lists management
  - Photo journal entries
  - User preferences

Routers are implemented in `app/routers/` and included in `main.py` with prefix patterns.

### Error Response Format

All API errors return a consistent JSON format:

```json
{
  "error": "error_type",
  "message": "Human-readable error message",
  "detail": {
    "additional": "context"
  }
}
```

**Error Types:**

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | `validation_error` | Request validation failed |
| 401 | `authentication_error` | Authentication required or failed |
| 404 | `not_found` | Requested resource not found |
| 500 | `internal_error` | Unexpected server error |
| 503 | `database_error` | Database unavailable or query failed |

Stack traces are logged server-side but never exposed to clients.

## Running the Server

### Development Mode (with hot reload)

```bash
python -m app.main
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload
```

The server will start at http://localhost:8000

### API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing the API

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "ok"}
```

### Root Endpoint

```bash
curl http://localhost:8000/
```

Expected response:
```json
{"message": "Noms API", "status": "healthy"}
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   └── main.py          # FastAPI app and endpoints
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Development Notes

- The server uses hot reload in development mode
- CORS is configured for Expo's default ports (8081, 19006)
- Database connection will be added in Phase 2
- Authentication endpoints will be added in Phase 4
- Google Places integration will be added in Phase 5

## Environment Variables

See `.env.example` for all available configuration options.

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `GOOGLE_PLACES_API_KEY` - Google Places API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key
