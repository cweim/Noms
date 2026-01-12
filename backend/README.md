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
