# Noms Mobile App

React Native mobile app for the Noms food discovery experience, built with Expo.

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Managed workflow for rapid development
- **TypeScript** - Type safety and better DX
- **Prettier** - Code formatting
- **ESLint** - Code linting

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (most values will be configured in later phases).

## Development

### Start Development Server

```bash
npm start
```

Or use the Expo CLI directly:

```bash
npx expo start
```

### Platform-Specific Commands

- **iOS Simulator**: Press `i` in the terminal, or run `npm run ios`
- **Android Emulator**: Press `a` in the terminal, or run `npm run android`
- **Web**: Press `w` in the terminal, or run `npm run web`

### Type Checking

Run TypeScript type checking:

```bash
npm run tsc
```

### Linting

ESLint and Prettier are configured. To check formatting:

```bash
npx eslint .
```

To auto-fix formatting issues:

```bash
npx eslint . --fix
```

## Project Structure

```
mobile/
├── App.tsx              # Main app entry point
├── app.json            # Expo configuration
├── assets/             # Images and static assets
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── .prettierrc         # Prettier configuration
├── .eslintrc.js        # ESLint configuration
└── .env.example        # Environment variables template
```

Future structure (will be added in later phases):
- `app/` - Screens and routes (Phase 6: Navigation)
- `components/` - Reusable UI components (Phase 7+)
- `lib/` - Utilities and helpers (as needed)
- `hooks/` - Custom React hooks (as needed)

## Development Notes

- The app uses Expo's managed workflow for maximum development speed
- Hot reload is enabled by default - changes appear instantly
- TypeScript provides type safety across the app
- UI follows the design system defined in `UI_SPEC.md`

## Environment Variables

See `.env.example` for all available configuration options.

Required variables (configured in later phases):
- `EXPO_PUBLIC_API_URL` - Backend API endpoint (Phase 3)
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY` - Google Maps API key (Phase 7)

## Navigation

Navigation will be configured in Phase 6 using Expo Router.

## API Integration

Backend API integration will be implemented starting in Phase 5.

## Design System

The app follows the design system specified in `UI_SPEC.md`:
- Color palette: Warm yellow (#FFC857), soft purple (#9B7EBD), warm peach (#FF9B71)
- Typography: System sans, heavy weights, tight tracking
- Spacing: 12-24px system
- Surfaces: Large border radius (rounded-2xl), soft shadows

## Testing

Testing setup will be added in a future phase if needed.
