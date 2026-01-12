# Phase 1 Discovery: Project Foundation

## Context

Setting up a monorepo for Noms with two distinct tech stacks:
- **Backend**: FastAPI (Python) + PostgreSQL
- **Mobile**: React Native with Expo

Need to establish directory structure, tooling, and development environment patterns that will support all future phases.

## Research Questions

1. What monorepo tool should we use for mixed JS/Python projects?
2. What directory structure supports both stacks cleanly?
3. How should we manage Python environment (venv, poetry, etc.)?
4. What shared tooling should we set up (formatting, linting)?

## Findings

### Monorepo Approach

**Decision: Simple directory structure with npm workspaces for JS, separate Python env**

**Rationale:**
- This is a small project with only 2 components
- No need for complex monorepo tools like Turborepo, Nx, or Lerna
- Python and JS don't need integrated build orchestration
- Keep it simple: two top-level directories

**Structure:**
```
/
├── backend/          # FastAPI Python app
│   ├── app/
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── mobile/           # React Native Expo app
│   ├── app/
│   ├── package.json
│   └── README.md
├── .gitignore        # Combined ignores
└── README.md         # Root documentation
```

### Python Environment Management

**Decision: Use venv with requirements.txt**

**Rationale:**
- Standard library approach, no additional dependencies
- Simple and explicit for solo development
- FastAPI docs recommend this for getting started
- Easy to upgrade to Poetry later if complexity grows

**Commands:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Mobile Setup

**Decision: Expo managed workflow**

**Rationale:**
- PROJECT.md explicitly specifies "React Native with Expo"
- Managed workflow is fastest for MVP
- Can eject to bare workflow later if needed
- Built-in development tools and OTA updates

**Setup:**
```bash
cd mobile
npx create-expo-app@latest . --template blank-typescript
```

### Tooling

**Formatting:**
- Python: Black (opinionated, zero-config)
- JS/TS: Prettier (standard in Expo projects)

**Linting:**
- Python: Ruff (fast, modern replacement for flake8/pylint)
- JS/TS: ESLint (comes with Expo)

**Type Checking:**
- Python: Pyright or mypy
- JS/TS: TypeScript compiler (included)

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/noms
GOOGLE_PLACES_API_KEY=xxx
SUPABASE_URL=xxx
SUPABASE_KEY=xxx
JWT_SECRET=xxx
```

**Mobile (.env):**
```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_MAPS_KEY=xxx
```

## Decisions

1. **Monorepo tool**: None (simple directories)
2. **Python env**: venv + requirements.txt
3. **Mobile framework**: Expo managed workflow with TypeScript
4. **Formatting**: Black (Python), Prettier (JS/TS)
5. **Linting**: Ruff (Python), ESLint (JS/TS)

## Implementation Notes

- Start with minimal tooling, add as needed
- Focus on getting dev servers running quickly
- Defer complex build orchestration until needed
- Keep configuration simple and explicit

## References

- [FastAPI Setup Guide](https://fastapi.tiangolo.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [Ruff Linter](https://github.com/astral-sh/ruff)
