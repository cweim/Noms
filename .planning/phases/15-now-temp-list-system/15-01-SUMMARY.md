---
phase: 15-now-temp-list-system
plan: 01
type: summary
---

# Summary: Swipeable Card with Gestures

## What Was Done

Added swipe up gesture to the bottom restaurant card for adding places to a "Consider now" temp list. Created new SwipeableBottomCard component with PanResponder for vertical gesture detection and integrated nowList state management in the Now screen.

## Changes

### 1. SwipeableBottomCard Component (`mobile/components/SwipeableBottomCard.tsx`)

Created new swipeable card wrapping the bottom card layout with gesture handling:

**Gesture detection:**
- PanResponder detects primarily vertical movements (dy > dx)
- SWIPE_UP_THRESHOLD = 50px
- Swipe up triggers onConsider callback
- Horizontal swipes ignored (buttons used for skip/save)

**Animations:**
- Card animates to y = -500 (off screen) on successful swipe
- Spring back to origin if threshold not met
- Subtle scale increase (1.0 → 1.02) as card lifts
- Orange "consider" overlay fades in approaching threshold

**Props:**
```typescript
interface SwipeableBottomCardProps {
  place: Place;
  photoUrl?: string;
  onSkip: (place: Place) => void;
  onSave: (place: Place) => void;
  onConsider: (place: Place) => void;  // NEW
}
```

**Swipe hint:**
- Shows "Swipe up to consider" text with chevron icon below card
- Subtle gray, 60% opacity for non-intrusive guidance

### 2. Now Screen Integration (`mobile/app/(tabs)/now.tsx`)

Updated to use SwipeableBottomCard and manage temp list:

**New state:**
```typescript
const [nowList, setNowList] = useState<Place[]>([]);
```

**handleConsider callback:**
- Adds place to nowList array
- Adds to skippedIds to advance to next card
- Logs "Considering: {name}" for debugging

**Count badge:**
- Shows "{N} considering" pill when nowList.length > 0
- Position: top-right, below safe area inset
- Style: orange background (#F97316), white text, rounded pill

**Reset behavior:**
- "Start Over" button now clears both skippedIds and nowList

## Files Changed

| File | Change |
|------|--------|
| `mobile/components/SwipeableBottomCard.tsx` | Created - swipeable card with vertical gesture |
| `mobile/app/(tabs)/now.tsx` | Updated - nowList state, count badge, SwipeableBottomCard |

## Verification

- [x] TypeScript check passes: `cd mobile && npx tsc --noEmit`
- [x] SwipeableBottomCard component exists
- [x] Swipe up on card triggers onConsider
- [x] Card animates up and off screen on successful swipe
- [x] Skip/Save buttons still work correctly
- [x] nowList count badge appears when list has items
- [x] Card advances to next restaurant after swipe up

## Notes

- nowList state is session-only (clears on app restart)
- Plan 15-02 will add TempListOverlay to review and select from nowList
- BottomRestaurantCard still exists but is no longer used by Now screen
- useSafeAreaInsets added for proper badge positioning

## Next Step

Ready for 15-02-PLAN.md (Temp List UI and Review)
