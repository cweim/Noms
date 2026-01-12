# Food Journal & Picker

## Project Summary

This repository contains a mobile-first food discovery app that helps users decide where to eat, save places naturally, and remember what they actually ate.

The product is intentionally designed to be useful for a **single user** and become smarter over time through usage.

See `PRD.md` for product intent and scope.

---

## Product Stage

This project is in early MVP stage.

UI, data models, and APIs are expected to evolve.
Backward compatibility is not guaranteed.

---

## Tech Stack

### Frontend
- React Native (Expo)

### Backend
- API server (FastAPI or Node.js)

### Database
- PostgreSQL

### Authentication
- Managed authentication provider

---

## High-Level Architecture

- Mobile client renders map, cards, and journal UI
- Client calls backend API for recommendations and persistence
- Backend queries a third-party Places API on-demand
- Backend stores user-generated data (saved places, journal entries)

---

## External Data Usage

This project uses a third-party Places API for restaurant discovery.

Important constraints:
- Place data is fetched **on-demand** per request
- The system does **not** crawl, scrape, or pre-index city-wide restaurant data
- API responses may be cached opportunistically
- Application logic assumes **limited result sets** and ranks within them

These constraints are intentional and align with the product design.

---

## Local Development

```bash
# install dependencies
npm install

# run development server
npm run dev

---

## Repo Structure
/frontend    # mobile app
/backend     # API server
/db          # migrations and seeds
/docs        # PRD and documentation
Environment & Secrets
Required environment variables (names only):
PLACES_API_KEY
DATABASE_URL
Secrets are loaded via environment configuration.
Development Rules
Keep logic simple and explicit
Prefer readability over abstraction
Do not introduce background ingestion jobs
Follow existing formatting and naming conventions