

# Full Layout & Effects Redesign Plan

## Overview
Complete redesign of all page layouts, sidebar, mobile nav, and AppLayout with enhanced 3D effects, 3D text in menus, professional transitions, minimal text, and full mobile optimization.

## Key Design Principles
- **3D text** on nav menu items and page headers using CSS `text-shadow` depth and `transform: perspective()` 
- **No unnecessary text** — remove verbose descriptions, keep only essential labels
- **Professional transitions** — spring-based page transitions, staggered card reveals, 3D flip on selection
- **Mobile-first** — all grids responsive, touch-friendly tap targets, optimized spacing

## Files to Edit

### 1. `src/index.css` — New 3D Text & Enhanced Effects
- Add `.text-3d` class with layered `text-shadow` creating depth illusion
- Add `.text-3d-hover` with transform perspective on hover
- Add `@keyframes shimmer-slide` for sidebar hover sweeps
- Add `.card-3d-pro` with enhanced perspective transforms and multi-layer shadows
- Add `.nav-item-3d` class for 3D menu text with depth shadows
- Enhance `.holo-card` hover to include stronger 3D lift and perspective rotation

### 2. `src/components/AppSidebar.tsx` — 3D Menu Text & Enhanced Transitions
- Apply 3D text-shadow to all nav item labels (depth effect using multiple offset shadows)
- Add `rotateX`/`rotateY` micro-tilt on hover per item (framer-motion)
- Enhanced active state with 3D pressed/recessed effect
- Remove any unnecessary labels, keep icons + short text only
- Smoother spring transitions on all interactive elements

### 3. `src/components/AppLayout.tsx` — Enhanced Page Transitions & Mobile
- Upgrade page transition: 3D perspective flip with blur dissolve (`rotateY` entry)
- Mobile nav: Add 3D depth shadow on active item, better touch targets (min 44px)
- Header: Cleaner, minimal — remove unnecessary text, keep only essential controls
- Cursor spotlight: Faster response, larger radius

### 4. `src/pages/Feed.tsx` — Professional Social Feed
- Remove verbose header text ("Real-time campus communications", "Broadcasting" status)
- Keep only "FEED" as 3D gradient header
- Post cards: Enhanced 3D hover with `perspective(600px) rotateX(2deg)` 
- Action buttons: 3D press effect with `translateZ` on tap
- Staggered entry with `rotateY` for each post card

### 5. `src/pages/Explore.tsx` — Clean Discovery Grid
- Remove "Scanner Active", "Detected Signals" text — keep only "EXPLORE" header with 3D text
- Category pills: 3D press effect on selection, lifted active state
- User cards: Enhanced 3D tilt on hover, remove redundant labels

### 6. `src/pages/Calendar.tsx` — Minimal Calendar
- Remove "Orbital Calendar" subtitle — keep "CALENDAR" with 3D text
- Calendar grid cells: 3D pop on hover/select
- Event cards: 3D slide-in from right

### 7. `src/pages/Timetable.tsx` — Clean Grid
- Remove "Schedule Matrix" — keep "TIMETABLE" with 3D text
- Grid cells: Subtle 3D lift on hover
- Controls: 3D toggle effect on batch selectors

### 8. `src/pages/Grades.tsx` — Minimal Analytics
- Remove "Performance Analytics" — keep "GRADES" with 3D header
- Cards: Enhanced 3D perspective on chart containers
- Inputs: 3D inset effect

### 9. `src/pages/CampusInfo.tsx` — Clean Campus Hub
- Remove "Campus Network" — keep "CAMPUS" with 3D text
- Tabs: 3D active indicator
- Quick links: Enhanced 3D card flip on hover

### 10. `src/pages/Resources.tsx` — Already clean, minor 3D enhancements
- Ensure 3D text on header
- Resource cards: consistent 3D hover with other pages

### 11. `src/pages/Notifications.tsx` — Minimal Alerts
- Remove "Signal Intercept" — keep "ALERTS" with 3D text
- Notification items: 3D slide-in from left

### 12. `src/pages/Profile.tsx` — Clean Profile
- Remove "IDENTITY REQUIRED" verbose text
- 3D header, enhanced banner parallax effect

### 13. `src/pages/Settings.tsx` — Minimal Settings
- Remove "System Config" — keep "SETTINGS" with 3D text
- Theme cards: 3D flip on selection

## Technical Approach

### 3D Text CSS (added to index.css)
```css
.text-3d {
  text-shadow:
    0 1px 0 hsl(var(--foreground) / 0.1),
    0 2px 0 hsl(var(--foreground) / 0.08),
    0 3px 0 hsl(var(--foreground) / 0.06),
    0 4px 8px hsl(0 0% 0% / 0.3);
}
```

### Sidebar 3D Nav Items
Each nav label gets the `text-3d` class plus framer-motion `rotateX` micro-tilt on hover, creating a physical depth effect in the menu.

### Page Transitions
Replace current `rotateX: -3` with a more dramatic `rotateY: -8` flip entry with spring physics, creating a card-flip feel when navigating between pages.

### Mobile Optimization
- All grids collapse to single column below `sm`
- Touch targets minimum 44x44px
- Mobile nav items get 3D depth indicators
- Reduced animation duration on mobile for performance

## Scope
- 13 files total
- All pages get consistent 3D text headers, minimal copy, enhanced hover/transition effects
- Full mobile responsiveness verified across all layouts

