# Summary: 07-01 Map View Setup

## What Was Built

### Task 1: Install Map and Location Packages
- Installed react-native-maps@1.20.1 and expo-location@19.0.8 via `npx expo install`
- Added expo-location plugin configuration to app.json
- Added iOS NSLocationWhenInUseUsageDescription permission in infoPlist
- Added Android ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION permissions

### Task 2: Create useLocation Hook
- Created lib/use-location.ts with custom location hook
- Handles foreground location permission requests
- Gets current position with high accuracy (fallback to balanced)
- Returns MapView-compatible region format (latitude, longitude, latitudeDelta, longitudeDelta)
- Provides loading, error, permissionStatus states
- Exports requestPermission callback for retry functionality
- TypeScript interfaces: LocationState, UseLocationResult

### Task 3: Replace Now Screen with MapView
- Replaced placeholder content with interactive MapView
- Loading state: ActivityIndicator with "Finding your location..." text
- Error state: Error message with "Enable Location" retry button
- Map view: Full-screen map centered on user's current location
- Enabled showsUserLocation (blue dot marker)
- Enabled showsMyLocationButton (recenter functionality)
- UI_SPEC styling: #F5F5F5 background, #1F2937 text, #6B7280 secondary

## Files Changed

**Created:**
- mobile/lib/use-location.ts

**Modified:**
- mobile/package.json (added react-native-maps, expo-location)
- mobile/package-lock.json (dependency tree updated)
- mobile/app.json (expo-location plugin, iOS/Android permissions)
- mobile/app/(tabs)/now.tsx (MapView implementation)

## Commits

1. `b11b260` - feat(07-01): install map and location packages
2. `e0f211e` - feat(07-01): create useLocation hook for location services
3. `7e93ffd` - feat(07-01): replace Now screen placeholder with MapView

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| expo-location plugin | Proper permission handling for iOS/Android |
| High accuracy with balanced fallback | Best accuracy when available, graceful degradation on timeout |
| Foreground permission only | MVP scope - background location not needed |
| useCallback for getLocation | Prevents unnecessary re-renders, enables retry functionality |
| showsUserLocation + showsMyLocationButton | Native blue dot and recenter button for UX |

## Verification

- [x] react-native-maps and expo-location installed
- [x] app.json has location permission configuration
- [x] useLocation hook handles permissions and returns location
- [x] Now screen shows map centered on user location
- [x] Loading and error states display correctly
- [x] User's position shown with blue dot (showsUserLocation)

## Notes

- TypeScript check (`npm run tsc`) has pre-existing type conflicts in node_modules between react-native globals and TypeScript DOM lib - not related to this phase's code
- The @expo/vector-icons error is a pre-existing issue from Phase 6 tab layout

## Next Steps

Continue to 07-02-PLAN.md for restaurant markers implementation.
