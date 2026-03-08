

# MNNIT InfoHub v2.0 — Implementation Plan

This is a large application with 10+ pages, Supabase backend, and AI features. To avoid issues, we'll build it in phases across multiple messages.

## Phase 1 (This Implementation)
Core infrastructure + static data pages that don't need database tables yet.

### 1. Data File
Copy the uploaded `infohub-data.ts` into `src/data/infohub-data.ts` with all academic events, notices, contacts, links, clubs, timetable data, grade system, and theme presets.

### 2. Database Setup (Supabase Migration)
Create all required tables with RLS:

- **profiles** — id (uuid, FK to auth.users), name, handle, avatar_url, bio, role, branch, section, created_at
- **posts** — id, user_id (FK profiles), content, image_url, video_url, media_type, tags (text[]), likes_count, comments_count, created_at
- **likes** — id, post_id (FK posts), user_id (FK profiles), unique constraint
- **comments** — id, post_id (FK posts), user_id (FK profiles), content, created_at
- **notifications** — id, user_id, type, message, read, link, created_at
- **user_roles** — id, user_id (FK auth.users), role (app_role enum) — per security guidelines
- Auto-create profile trigger on signup
- Storage buckets: `avatars` (public), `post-media` (public)
- RLS policies: users read all profiles/posts, edit only their own

### 3. Auth System
- `src/contexts/AuthContext.tsx` — auth state, session listener, login/signup/logout
- `src/pages/Auth.tsx` — split-screen design, login/register tabs, collects name/email/branch/section
- Animated intro sequence on first login (3-step welcome)
- Protected route wrapper component

### 4. App Layout & Routing
- `src/components/AppLayout.tsx` — sidebar (desktop) + bottom nav (mobile)
- Sidebar with icons: Feed, Explore, Campus Info, Calendar, Timetable, Grades, Resources, Notifications, Profile
- Theme system with 6 presets using CSS variables
- Settings modal (theme picker, display name)
- Command palette (Cmd+K) with fuzzy search

### 5. Pages (Phase 1 — Static Data + Basic Social)

| Page | Key Features |
|------|-------------|
| **Feed** | Post list from Supabase, create post modal, like/comment, image upload |
| **Explore** | Search posts/users, trending tags, discover students |
| **Campus Info** | Quick links grid, contact directory (tabbed), academic notices, clubs |
| **Calendar** | Monthly calendar view, color-coded events from ACADEMIC_EVENTS, day detail, upcoming sidebar |
| **Timetable** | Section selector, batch toggle, weekly grid, color-coded by type, today/current-class highlight |
| **Grades** | Multi-semester CPI calculator, SPI per semester, target CPI predictor, localStorage persistence |
| **Resources** | Upload/download study materials, branch/semester filter |
| **Notifications** | List from Supabase + system notices, mark read, unread badge |
| **Profile** | View/edit profile, own posts grid, stats |

### 6. AI Features (via Lovable AI Gateway)
Edge function `supabase/functions/chat/index.ts` using LOVABLE_API_KEY (already available) to power:
- Feed summarizer
- Campus AI search
- Study tip generator
- Resource finder

Each AI use case will branch inside the edge function based on a `type` parameter.

## Technical Details

**Dependencies to add:** `framer-motion` for animations

**File structure:**
```text
src/
├── contexts/AuthContext.tsx
├── data/infohub-data.ts          (uploaded file, read-only)
├── components/
│   ├── AppLayout.tsx
│   ├── AppSidebar.tsx
│   ├── ProtectedRoute.tsx
│   ├── CommandPalette.tsx
│   ├── ThemeProvider.tsx
│   ├── feed/ (PostCard, CreatePostModal, FeedSummarizer)
│   ├── campus/ (ContactDirectory, NoticesPanel, QuickLinks, ClubsList)
│   ├── calendar/ (CalendarView, EventDetail)
│   ├── timetable/ (TimetableGrid, SectionSelector)
│   ├── grades/ (GradeCalculator, CPIChart)
│   ├── resources/ (ResourceList, UploadModal)
│   └── profile/ (ProfileView, EditProfileModal)
├── pages/
│   ├── Auth.tsx
│   ├── Feed.tsx, Explore.tsx, CampusInfo.tsx
│   ├── Calendar.tsx, Timetable.tsx
│   ├── Grades.tsx, Resources.tsx
│   ├── Notifications.tsx, Profile.tsx
│   └── Settings.tsx
├── hooks/ (useAuth, useTheme, usePosts, useNotifications)
└── lib/ (theme constants, grade utils)
supabase/functions/chat/index.ts
```

**Theme system:** CSS variables on `:root`, switched by a React context. 6 presets stored in the data file + custom color picker.

**Routing:** All routes wrapped in `ProtectedRoute` except `/auth`. React Router v6.

This is a large build. I'll implement it methodically — database migration first, then auth, then layout, then pages one by one. Ready to proceed?

