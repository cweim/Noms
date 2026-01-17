# Roadmap: Noms

## Overview

Building a map-first food discovery app from foundation to launch. Starting with infrastructure and core systems (database, APIs, auth), then implementing the three core user flows (Now/Saved/Journal), and finishing with integration testing and polish. Each phase delivers a complete, verifiable capability that builds toward a calm, single-user MVP.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Foundation** - Set up monorepo structure, dev environment, and tooling
- [x] **Phase 2: Database Schema** - Design and implement PostgreSQL schema for users, places, saves, and journal entries
- [x] **Phase 3: Backend API Foundation** - FastAPI server setup, health checks, error handling
- [x] **Phase 4: Authentication** - Supabase Auth integration for user signup/login
- [x] **Phase 5: Google Places Integration** - Connect to Google Places API, implement search and details endpoints
- [x] **Phase 6: Mobile App Foundation** - React Native/Expo setup, navigation structure, bottom tabs
- [x] **Phase 7: Map View** - Interactive map with location services and place pins
- [x] **Phase 8: Restaurant Cards** - Swipeable card UI with restaurant details and actions
- [ ] **Phase 9: Restaurant Picker Logic** - On-demand fetching, preference-based ranking, skip/like actions
- [ ] **Phase 10: Saved Places** - Save functionality, default list, persistent storage
- [ ] **Phase 11: Photo Journal** - Photo capture, place detection, optional rating, journal entries
- [ ] **Phase 12: Integration & Polish** - End-to-end testing, UI polish, cross-platform verification

## Phase Details

### Phase 1: Project Foundation
**Goal**: Establish monorepo structure, development environment, and tooling
**Depends on**: Nothing (first phase)
**Research**: Unlikely (monorepo setup, established patterns)
**Plans**: 2 plans

Plans:
- [x] 01-01: Backend Foundation - FastAPI setup, health endpoints, environment config
- [x] 01-02: Mobile Foundation - React Native/Expo setup with TypeScript and tooling

### Phase 2: Database Schema
**Goal**: Design and implement PostgreSQL schema for all data models
**Depends on**: Phase 1
**Research**: Completed (Level 2 - Standard Research)
**Plans**: 2 plans

Plans:
- [x] 02-01: Database Foundation - Supabase project setup, core schema migration
- [x] 02-02: Database Optimization - Performance indexes, triggers, Row Level Security

### Phase 3: Backend API Foundation
**Goal**: Set up FastAPI server with health checks and error handling
**Depends on**: Phase 2
**Research**: Completed (Level 0 - No discovery needed)
**Plans**: 2 plans

Plans:
- [x] 03-01: Supabase Integration - Database client and health monitoring
- [x] 03-02: API Infrastructure - Error handling and router structure

### Phase 4: Authentication
**Goal**: Integrate Supabase Auth for user signup and login
**Depends on**: Phase 3
**Research**: Completed (Level 2 - Standard Research)
**Plans**: 1 plan

Plans:
- [x] 04-01: JWT Validation and User Profile Trigger - Backend auth foundation

### Phase 5: Google Places Integration
**Goal**: Connect to Google Places API and implement search/details endpoints
**Depends on**: Phase 3
**Research**: Completed (Level 2 - Standard Research)
**Plans**: 3 plans

Plans:
- [x] 05-01: Google Places Service Module - API client wrapper with caching
- [x] 05-02: Places Search Endpoint - Router and Pydantic schemas
- [x] 05-03: Place Details and Photo Endpoints - Complete integration

### Phase 6: Mobile App Foundation
**Goal**: Set up React Native/Expo with navigation and bottom tabs
**Depends on**: Phase 3
**Research**: Completed (Level 0 - No discovery needed)
**Plans**: 1 plan

Plans:
- [x] 06-01: Navigation and Tabs - Expo Router, bottom tabs, Supabase client

### Phase 7: Map View
**Goal**: Build interactive map with location services and place pins
**Depends on**: Phase 6
**Research**: Completed (Level 1 - Quick Verification)
**Plans**: 2 plans

Plans:
- [x] 07-01: Location Services and Map Foundation - expo-location, react-native-maps, Now screen map
- [x] 07-02: Restaurant Markers - PlaceMarker component, mock data rendering

### Phase 8: Restaurant Cards
**Goal**: Implement swipeable card UI with restaurant details and actions
**Depends on**: Phase 6
**Research**: Skipped (Level 0 - established gesture library patterns)
**Plans**: 1 plan

Plans:
- [x] 08-01: Swipeable Restaurant Cards - Gesture handling, card component, skip/like actions

### Phase 9: Restaurant Picker Logic
**Goal**: Implement on-demand fetching, preference-based ranking, and skip/like actions
**Depends on**: Phase 5, Phase 7, Phase 8
**Research**: Skipped (Level 0 - established patterns, internal logic)
**Plans**: 2 plans

Plans:
- [x] 09-01: API Integration - API client module, usePlaces hook for data fetching
- [ ] 09-02: Restaurant Picker UI - Card stack, skip/like state, ranking logic

### Phase 10: Saved Places
**Goal**: Build save functionality with default list and persistent storage
**Depends on**: Phase 9
**Research**: Unlikely (standard CRUD operations)
**Plans**: TBD

Plans:
- [ ] TBD during phase planning

### Phase 11: Photo Journal
**Goal**: Implement photo capture, place detection, optional rating, and journal entries
**Depends on**: Phase 6
**Research**: Likely (photo handling and permissions)
**Research topics**: Expo Camera vs ImagePicker APIs, photo permissions on iOS/Android, nearby place detection logic, image storage strategies
**Plans**: TBD

Plans:
- [ ] TBD during phase planning

### Phase 12: Integration & Polish
**Goal**: End-to-end testing, UI polish, and cross-platform verification
**Depends on**: Phase 10, Phase 11
**Research**: Unlikely (internal testing and polish)
**Plans**: TBD

Plans:
- [ ] TBD during phase planning

## Progress

**Execution Order:**
Numeric sort (1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 2/2 | Complete | 2026-01-13 |
| 2. Database Schema | 2/2 | Complete | 2026-01-13 |
| 3. Backend API Foundation | 2/2 | Complete | 2026-01-14 |
| 4. Authentication | 1/1 | Complete | 2026-01-14 |
| 5. Google Places Integration | 3/3 | Complete | 2026-01-15 |
| 6. Mobile App Foundation | 1/1 | Complete | 2026-01-15 |
| 7. Map View | 2/2 | Complete | 2026-01-16 |
| 8. Restaurant Cards | 1/1 | Complete | 2026-01-17 |
| 9. Restaurant Picker Logic | 1/2 | In progress | - |
| 10. Saved Places | 0/TBD | Not started | - |
| 11. Photo Journal | 0/TBD | Not started | - |
| 12. Integration & Polish | 0/TBD | Not started | - |
