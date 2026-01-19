# Roadmap: Noms

## Overview

Building a map-first food discovery app from foundation to launch. Starting with infrastructure and core systems (database, APIs, auth), then implementing the three core user flows (Now/Saved/Journal), and finishing with integration testing and polish. Each phase delivers a complete, verifiable capability that builds toward a calm, single-user MVP.

## Domain Expertise

None

## Milestones

- ✅ **v1.0 MVP** - Phases 1-12 (shipped 2026-01-18)
- 🚧 **v1.1 Now Flow Redesign** - Phases 13-17 (in progress)

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
- [x] **Phase 9: Restaurant Picker Logic** - On-demand fetching, preference-based ranking, skip/like actions
- [x] **Phase 10: Saved Places** - Save functionality, default list, persistent storage
- [x] **Phase 11: Photo Journal** - Photo capture, place detection, optional rating, journal entries
- [x] **Phase 12: Integration & Polish** - End-to-end testing, UI polish, cross-platform verification
- [x] **Phase 13: Bug Fix & Backend Prep** - Fix saved images, prepare details endpoint
- [ ] **Phase 14: Now Page UX Redesign** - Bottom card layout, map highlighting current restaurant
- [ ] **Phase 15: Now Temp List System** - Swipe up gesture, temp list storage, review phase
- [ ] **Phase 16: Place Details Screen** - Full info, photo gallery, Google reviews
- [ ] **Phase 17: Integration & Polish** - Connect all flows, cross-platform testing

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
- [x] 09-02: Restaurant Picker UI - Card stack, skip/like state, ranking logic

### Phase 10: Saved Places
**Goal**: Build save functionality with default list and persistent storage
**Depends on**: Phase 9
**Research**: Skipped (Level 0 - standard CRUD operations)
**Plans**: 2 plans

Plans:
- [x] 10-01: Backend Saves API - Pydantic schemas and CRUD endpoints
- [x] 10-02: Mobile Saved Places UI - Save hook, saved screen, picker integration

### Phase 11: Photo Journal
**Goal**: Implement photo capture, place detection, optional rating, and journal entries
**Depends on**: Phase 6
**Research**: Completed (Level 1 - Quick Verification)
**Research topics**: expo-image-picker APIs, Supabase Storage upload patterns
**Plans**: 3 plans

Plans:
- [ ] 11-01: Backend Journal API - Pydantic schemas and CRUD endpoints for journal_entries
- [ ] 11-02: Mobile Photo Capture - expo-image-picker, Supabase Storage upload
- [ ] 11-03: Journal Screen UI - FlatList display, add entry modal, FAB

### Phase 12: Integration & Polish
**Goal**: End-to-end testing, UI polish, and cross-platform verification
**Depends on**: Phase 10, Phase 11
**Research**: Skipped (Level 0 - internal testing and polish)
**Plans**: 3 plans

Plans:
- [x] 12-01: Auth UI - Login/signup screen with Supabase Auth
- [x] 12-02: End-to-End Flow Verification - Test all three core flows with checkpoints
- [x] 12-03: Final Polish - Sign out, pull-to-refresh, UI consistency

### 🚧 v1.1 Now Flow Redesign (In Progress)

**Milestone Goal:** Redesign the core picker UX with bottom cards, map integration, two-list system (Save for later vs Consider now), and place details screen

#### Phase 13: Bug Fix & Backend Prep
**Goal**: Fix saved places images bug and prepare backend for details endpoint
**Depends on**: Phase 12 (previous milestone complete)
**Research**: Unlikely (internal bug fix, existing patterns)
**Plans**: 2 plans

Plans:
- [x] 13-01: Fix Saved Places Images Bug - Debug and fix photo_reference caching
- [x] 13-02: Backend Details Endpoint Prep - PlaceDetails schema and endpoint

#### Phase 14: Now Page UX Redesign
**Goal**: Transform picker to bottom card layout with map highlighting current restaurant
**Depends on**: Phase 13
**Research**: Skipped (Level 0 - existing patterns)
**Plans**: 1 plan

Plans:
- [x] 14-01: Bottom Card Layout - Create compact bottom card, map centering, selected marker

#### Phase 15: Now Temp List System
**Goal**: Implement swipe up gesture for "Now" list, temp list storage, and review phase
**Depends on**: Phase 14
**Research**: Skipped (Level 0 - existing patterns)
**Plans**: 2 plans

Plans:
- [x] 15-01: Swipeable Card with Gestures - SwipeableBottomCard, swipe up detection, nowList state
- [x] 15-02: Temp List UI and Review - TempListOverlay, selection flow, list management

#### Phase 16: Place Details Screen
**Goal**: Full restaurant details with name, address, phone, hours, photo gallery, and Google reviews
**Depends on**: Phase 13
**Research**: Skipped (Level 0 - backend already prepared in Phase 13-02)
**Plans**: 2 plans

Plans:
- [x] 16-01: Place Details Screen Core - API client, PlaceDetailsScreen component, photo endpoint
- [x] 16-02: Navigation Integration - Connect Now and Saved screens to details

#### Phase 17: Integration & Polish
**Goal**: Connect all flows, cross-platform testing, final polish
**Depends on**: Phase 14, Phase 15, Phase 16
**Research**: Unlikely (internal testing)
**Plans**: TBD

Plans:
- [ ] 17-01: TBD

## Progress

**Execution Order:**
Numeric sort (1 → 2 → ... → 12 → 13 → 14 → 15 → 16 → 17)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Project Foundation | v1.0 | 2/2 | Complete | 2026-01-13 |
| 2. Database Schema | v1.0 | 2/2 | Complete | 2026-01-13 |
| 3. Backend API Foundation | v1.0 | 2/2 | Complete | 2026-01-14 |
| 4. Authentication | v1.0 | 1/1 | Complete | 2026-01-14 |
| 5. Google Places Integration | v1.0 | 3/3 | Complete | 2026-01-15 |
| 6. Mobile App Foundation | v1.0 | 1/1 | Complete | 2026-01-15 |
| 7. Map View | v1.0 | 2/2 | Complete | 2026-01-16 |
| 8. Restaurant Cards | v1.0 | 1/1 | Complete | 2026-01-17 |
| 9. Restaurant Picker Logic | v1.0 | 2/2 | Complete | 2026-01-17 |
| 10. Saved Places | v1.0 | 2/2 | Complete | 2026-01-17 |
| 11. Photo Journal | v1.0 | 3/3 | Complete | 2026-01-18 |
| 12. Integration & Polish | v1.0 | 3/3 | Complete | 2026-01-18 |
| 13. Bug Fix & Backend Prep | v1.1 | 2/2 | Complete | 2026-01-18 |
| 14. Now Page UX Redesign | v1.1 | 1/1 | Complete | 2026-01-19 |
| 15. Now Temp List System | v1.1 | 2/2 | Complete | 2026-01-19 |
| 16. Place Details Screen | v1.1 | 2/2 | Complete | 2026-01-19 |
| 17. Integration & Polish | v1.1 | 0/? | Not started | - |
