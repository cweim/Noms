# Noms

A map-first food app that helps urban eaters decide quickly when hungry, save inspiration naturally, and remember what they actually ate. Designed to be useful for a single user on day one and improve automatically as usage accumulates through a calm, low-friction mobile experience.

## Project Structure

```
noms-app/
├── backend/          # FastAPI backend API server
├── mobile/           # React Native Expo mobile app
├── .planning/        # Project planning and roadmap
└── README.md         # This file
```

## Tech Stack

**Backend:**
- FastAPI (Python) - API server
- PostgreSQL - Database
- Supabase Auth - Authentication

**Mobile:**
- React Native with Expo - Cross-platform mobile app
- TypeScript - Type safety
- Google Places API - Restaurant discovery

## Quick Start

### Backend

See [backend/README.md](backend/README.md) for detailed setup instructions.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

Backend runs at http://localhost:8000

### Mobile

See [mobile/README.md](mobile/README.md) for detailed setup instructions.

```bash
cd mobile
npm install
npm start
```

Press `i` for iOS simulator or `a` for Android emulator.

## Development

- **Backend**: FastAPI with hot reload on port 8000
- **Mobile**: Expo development server with hot reload

## Documentation

- [PRD.md](PRD.md) - Product Requirements Document
- [UI_SPEC.md](UI_SPEC.md) - UI Design Specification
- [.planning/PROJECT.md](.planning/PROJECT.md) - Project overview and decisions
- [.planning/ROADMAP.md](.planning/ROADMAP.md) - Development roadmap

## Architecture

The app follows a client-server architecture:
- Mobile client renders UI (map, cards, journal)
- Backend API handles business logic and persistence
- Google Places API provides restaurant data on-demand
- PostgreSQL stores user-generated data (saves, journal entries)

No background jobs or complex state management - keep it simple and explicit.