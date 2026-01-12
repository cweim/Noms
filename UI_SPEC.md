# UI_SPEC

Purpose: Extract visual/design decisions from the reference UI for reuse.

Product concept
- Mobile-first restaurant discovery app with three tabs: Now (map + swipe card), Saved (grid), Journal (masonry photo log).
- Container mimics a device viewport: centered, max-width, full-height, rounded top nav, soft shadows.

Layout + structure
- Global frame: center-aligned phone frame with `max-w-md`, `h-[100dvh]`, white surface, `shadow-2xl`, `overflow-hidden`.
- Bottom navigation: fixed to bottom, pill-top shape with large circular tab buttons; active tab lifts up.
- Screen padding: top padding for status bar (`pt-12`), bottom padding to clear nav (`pb-24`/`pb-28`).
- Now screen: full-bleed map background with floating header controls and a single large card anchored bottom.
- Saved screen: vertical stack with header + action bar + 2-column grid of square cards plus “Add Place” tile.
- Journal screen: masonry layout using CSS columns with mixed aspect ratios; includes CTA tile at end.

Typography
- Default font: system sans (Tailwind `font-sans`).
- Headings: heavy weight (`font-black`), tight tracking (`tracking-tight`), large sizes (`text-3xl`).
- Labels/meta: small caps/compact sizes (`text-[10px]`, `text-xs`, `text-sm`), medium to bold weight.
- Overlays on images: white text with subtle opacity (`text-white/70`, `text-white/95`) and uppercase tracking for dates.

Color palette
- Primary accent: warm yellow `#FFC857` (active map pin, CTA buttons, save state).
- Secondary accent: soft purple `#9B7EBD` (Saved tab active, hover accents).
- Tertiary accent: warm peach `#FF9B71` (Journal tab active, map pin icon color).
- Backgrounds: light gray `#F5F5F5`, warm cream `#FFF8E7`, neutral `#F3F4F6`/`gray-50`.
- Text: charcoal `#1F2937`/`gray-800`, muted `#6B7280`/`gray-500`.
- Status color: green `#16A34A` + `bg-green-50` for “Open now”.

Surfaces, borders, and radii
- Cards: large radius (`rounded-[2rem]`), strong shadow (`shadow-xl`), soft hover lift.
- Pills/chips: full rounded (`rounded-full`), translucent backgrounds with blur (`backdrop-blur-md`).
- Image tiles: `rounded-2xl`, gradient overlays, subtle borders (`border-white/10`).
- Dashed placeholder: `border-dashed` + `border-2`, subtle accent on hover.

Iconography
- Line icons from Lucide, 20–24px, stroke 2–2.5.
- Icons sit in circular buttons (40–48px) with soft shadows.
- Emoji used as map pins and journal entry badges (large, playful).

Imagery and overlays
- Hero card image: full bleed with `bg-gradient-to-t from-black/40` overlay.
- Saved/Journal tiles: stronger gradient (`from-black/70` to transparent).
- Floating emoji overlay in Journal entries with drop shadow and hover scale/rotate.

Map styling
- Abstract map composed of skewed white “roads,” pale green “parks,” and blue water shape.
- Pins: white circular base with emoji; active pin scales to 1.25x and uses accent fill.
- User location: small blue dot with `animate-ping` halo.

Motion and interaction
- Global transitions: `transition-all duration-300`, subtle hover scale (`1.02`–`1.1`).
- Active tab buttons translate upward (`-translate-y-2`) with colored shadow.
- Image tiles zoom slightly on hover (`group-hover:scale-110`).
- Pin scale transitions over 500ms.

Components
- BottomNav: 3 circular buttons (Now/Saved/Journal) with text label at `text-[10px]`, active color and shadow.
- RestaurantCard: image header + save button (star), name + cuisine + price chips, location + status row, “Skip/Like” actions.
- SavedCard: square image tile with price badge and bottom text overlay.
- JournalEntry: variable aspect ratio tile with gradient text overlay and emoji sticker.

Spacing system
- Section padding: 16–24px (`p-4`, `p-6`).
- Gaps: 12–16px between controls (`gap-3`, `gap-4`).
- Buttons: height ~40–48px for icons, 12px vertical for CTAs (`py-3`).

Notes
- The UI is intentionally playful and tactile: soft shadows, rounded shapes, warm accents.
- All screens reserve bottom space for the fixed nav.
