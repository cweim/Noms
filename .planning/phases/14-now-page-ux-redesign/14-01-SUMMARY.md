---
phase: 14-now-page-ux-redesign
plan: 01
type: summary
---

# Summary: Bottom Card Layout

## What Was Done

Transformed the Now screen picker from center-screen card to bottom-positioned compact card with map centered on current restaurant for spatial context.

## Changes

### 1. BottomRestaurantCard Component (`mobile/components/BottomRestaurantCard.tsx`)

Created new compact horizontal card component:

```
Layout: [Photo 100x100] [Info: Name, Rating, Address] [Skip/Save buttons]
Height: 120px
Width: Screen width - 32px (16px padding each side)
```

Features:
- Square photo thumbnail with rounded corners
- Info section: name (1 line), rating with star icon, address (1 line)
- Two action buttons: Skip (red X) and Save (green heart)
- TouchableOpacity buttons (no swipe gestures - those come in Phase 15)
- White background, rounded corners, shadow for depth

### 2. Now Screen Redesign (`mobile/app/(tabs)/now.tsx`)

Major layout changes:
- Replaced RestaurantPicker with BottomRestaurantCard at screen bottom
- Positioned card 100px from bottom (above tab bar)
- Added MapView ref for programmatic map control

State management:
- `skippedIds` Set to track dismissed places
- `token` state for authenticated photo URLs
- `selectedPlaceId` derived from current place

Map centering:
- `useEffect` animates map to current restaurant location
- 500ms animation duration with 0.005 delta zoom level
- Triggers when `currentPlace.google_place_id` changes

Additional UI states:
- Loading card while fetching restaurants
- Error card for fetch failures
- Empty state with "Start Over" button when all places skipped

### 3. PlaceMarker Selected State (`mobile/components/PlaceMarker.tsx`)

Added visual distinction for selected restaurant:

| Property | Normal | Selected |
|----------|--------|----------|
| Icon size | 20 | 28 |
| Padding | 8px | 14px |
| Background | #F97316 | #EA580C (darker) |
| Border | none | 3px white |
| Shadow | 0.25 opacity | 0.4 opacity |
| zIndex | 1 | 1000 |

New prop: `isSelected?: boolean` (defaults to false for backward compatibility)

## Files Changed

| File | Change |
|------|--------|
| `mobile/components/BottomRestaurantCard.tsx` | Created - compact horizontal card |
| `mobile/app/(tabs)/now.tsx` | Redesigned - bottom card, map centering |
| `mobile/components/PlaceMarker.tsx` | Updated - selected state styling |

## Verification

- [x] TypeScript check passes: `cd mobile && npx tsc --noEmit`
- [x] BottomRestaurantCard component exists and renders correctly
- [x] Now screen shows card at bottom (not center)
- [x] Map animates to current restaurant when card changes
- [x] Selected marker is visually distinct
- [x] Skip button advances to next restaurant
- [x] Save button saves and advances to next restaurant

## Notes

- RestaurantPicker and SwipeableCard components still exist but are no longer used by Now screen
- Phase 15 will add swipe gestures (swipe up for "Now" temp list)
- Photo URLs now use token-authenticated endpoint from Phase 13

## Screenshots

The Now screen now shows:
1. Full map view as background
2. Compact card at bottom with restaurant photo, info, and action buttons
3. Current restaurant marker highlighted (larger, darker, white border)
4. Map smoothly animates to center on each new restaurant
