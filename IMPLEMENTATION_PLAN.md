# Your Sofia - Implementation Plan (draft)

## Project Overview

**Your Sofia** is an open-source civic engagement platform for Sofia residents, consisting of:

- **Mobile App** (React Native/Expo): Citizen-facing application for reporting issues, viewing news, and navigating city services
- **API Backend** (Payload CMS/Next.js): Content management and data services

### Core Mission

Creating a better living environment through active interaction between citizens and administration via:

- 📰 Informing citizens through news, notifications, and location-based updates
- 🗺️ Caring for urban environment through signal reporting and city object mapping
- ⚙️ Efficient city administration through internal interfaces for signal processing and work assignments

---

## Epic Features

### 1. News & Notifications System

**Repository**: `your-sofia-mobile`  
**Priority**: High  
**Status**: In Progress

#### Purpose

Provide citizens with timely, relevant information about city events, infrastructure changes, and emergencies through rich media content and push notifications.

#### Tasks

- [x] **Fix RichText Display** - `react-native-markdown-display` rendering `markdownText` in `app/(tabs)/home/[id].tsx`; per-node `fontFamily` tokens applied
- [x] **What's New Splash Screen** - Onboarding for new users and update announcements (`app/whats-new.tsx`, `lib/whatsNew.ts`; version-delta trigger via AsyncStorage)
- [x] **Push Notifications Integration** - `hooks/useNotifications.ts` registers with `expo-notifications`, obtains Expo push token, syncs to backend `PushTokens` collection, handles incoming notification events and deep-link routing
- [x] **Notification Subscription System** - `app/(tabs)/notifications/index.tsx` with category chip filters, location filter management (district picker, point-radius picker, drawn-area picker), `useSubscription` hook persists to backend, `lib/notificationFilterBridge` bridges picker screens
- [ ] **Bell Icon Modal Summary** - Notification center with unread count and history

#### News & Notification Screens — Information Hierarchy (Design Decision)

**News feed card hierarchy (NewsCard component):**

1. Thumbnail image (full-width, 16:9, ~200px)
2. Category badge (top-left overlay, using DESIGN.md tag radius 6px, #2F54C5 bg)
3. Headline — Sofia Sans SemiBold, 18px, 2-line clamp
4. Publish date — JetBrains Mono, small, muted (relative: "2 hours ago")
5. Short excerpt — 2-line clamp, body text

**News article detail hierarchy:**

1. Hero image (full-bleed, top of screen, ~240px)
2. Category + date row (below image, small)
3. Headline — Sofia Sans Bold, 22-24px
4. Body rich text — respects DESIGN.md typography
5. Related articles at bottom (optional)

**Bell icon modal hierarchy:**

1. Header: "Известия" (Notifications) + unread count badge
2. "Mark all as read" link (top right)
3. List: unread items first (grouped by date), read items dimmed
4. Per item: icon (notification type) + title + timestamp
5. Empty state: illustration + "Няма известия" + informational copy

**What's New splash screen hierarchy:**

1. App logo + "Твоята София" wordmark (top center)
2. Version tag: "Версия X.X" (JetBrains Mono, small, muted)
3. "Какво ново?" ("What's New?") heading — Sofia Sans Bold, 24px
4. Feature list: 3-4 bullets with short descriptions
5. Primary CTA: "Напред" ("Continue") button — full-width, #2F54C5, 10px radius
6. Skip link: small, muted, below CTA

#### Technical Considerations

- Use `expo-notifications` for cross-platform push notifications
- Implement local storage for offline notification access
- Image caching for performance optimization
- Rich text rendering with proper sanitization

#### Acceptance Criteria

- News articles display properly formatted content
- Images show timestamp and location metadata
- First-time users see What's New screen
- Push notifications work on iOS and Android
- Notification center accessible via bell icon

---

### 2. Interactive Map System

**Repository**: `your-sofia-mobile`  
**Priority**: High  
**Status**: In Progress

#### Purpose

Enable citizens to navigate city infrastructure, view waste containers, air quality stations, and add new city objects.

#### Tasks

- [x] **AR View Mode** - `app/(tabs)/maps/ar-view.tsx`: nearby waste containers rendered in compass-oriented AR overlay with real-time distance labels and expected/last cleaning time
- [x] **Multiple Map Views** - waste-containers, news, events, bgsmet-view, transport-bpilot sub-screens under `app/(tabs)/maps/`
- [x] **Bulk Photo Upload** - `app/(tabs)/new/bulk-photo-upload.tsx` with media library picker and EXIF metadata extraction
- [ ] **Expandable + Icon (FAB)** - Allow users to initiate adding new city objects from the map tab
- [ ] **Object Type Selection Dialog** - UI for choosing what type of object to add
- [ ] **Performance Optimization / Map Clustering** - Handle 1000+ markers efficiently

#### Technical Considerations

- Use `react-native-maps` with `react-native-map-clustering` for marker clustering
- **PREREQUISITE (Epic 2):** Run a compatibility spike before implementing — `pnpm add react-native-map-clustering` + basic render test with RN 0.81.5 and React 19. If incompatible, fall back to `supercluster` + manual renderer.
- Implement debouncing for map interactions
- Geospatial indexing on backend

#### Acceptance Criteria

- Users can tap + icon to add new objects
- Object type selection is intuitive
- Map performs smoothly with many markers
- Consistent behavior across iOS and Android

---

### 3. Waste Container Management

**Repository**: `your-sofia-mobile` (primary), `your-sofia-api` (backend)  
**Priority**: High  
**Status**: In Progress

#### Purpose

Comprehensive CRUD system for waste containers allowing citizens to report, view status, and navigate to containers.

#### Tasks (Mobile)

- [x] **Edit Container Form** - `WasteContainerCard` admin edit modal using `forms/waste-container/WasteContainerForm.tsx` (Zod-validated, react-hook-form, all metadata fields)
- [x] **Clean Container Workflow** - Admin-only modal in `WasteContainerCard`: mandatory photo via `expo-camera`, optional notes, submit via `createWasteContainerObservation` API
- [x] **Observations History Modal** - Cleaning history modal in `WasteContainerCard`
- [ ] **Add New Container Form (creation)** - Full creation flow with map pin placement for new containers
- [ ] **Google Maps Navigation** - "Navigate To" button opening Google Maps with directions
- [ ] **Adjust Location** - Allow precise container location adjustment on map

#### Add New Container Form — Field Order (Design Decision)

Confirmed field sequence:

1. **Location on map** — Full-width map, GPS pre-fills pin; user confirms or adjusts
2. **Container type** — Tap selection: Paper / Plastic / Glass / Mixed / Food waste
3. **Address** — Auto-filled from geocoded GPS coordinates; editable text field
4. **Notes** — Optional free text for special instructions or condition notes
5. **Photo** — Optional; camera or gallery
6. **Submit**

**Hierarchy per screen:**

- Step 1: Map (full-width, ~200px tall) → GPS coordinates label → "Confirm" CTA → "Adjust pin" below map
- Step 2: 2-column type grid with icons + labels in Sofia Sans; selected state uses #2F54C5 border + tint
- Step 3: Auto-filled text input (editable); JetBrains Mono for coordinates if shown raw
- Steps 4-5: Standard text area + photo picker row

#### Tasks (Backend)

- [x] **Transform Location to PayloadCMS Point** - ~~DONE~~ `WasteContainers` already has `location: { type: 'point' }` — Payload CMS natively supports `type: 'point'` fields; no custom plugin required
- [ ] **Admin UI Map Integration** - Add map interface in admin panel
- [ ] **Adjust Point on Map** - Enable location editing in admin UI
- [ ] **Versioning System** - Implement object versioning (requires custom migration)
- [ ] **Pending Approval State** - New containers start in pending state requiring review

#### Technical Considerations

- Use `expo-location` for geolocation
- Implement `react-native-image-picker` for photos
- Google Maps deep linking for navigation
- Form validation and error handling
- PostgreSQL with PostGIS for geospatial data
- Payload CMS version/draft system customization

#### Acceptance Criteria

- Users can add/edit containers with complete information
- Navigation opens Google Maps with directions
- Container location adjustable on map
- Admin approval workflow for new containers
- All container metadata visible on card

---

### 4. Multi-Type City Objects System

**Repository**: `your-sofia-api` (primary), `your-sofia-mobile` (UI)  
**Priority**: High  
**Status**: Not Started

#### Purpose

Enable creation and management of various city object types beyond waste containers, allowing the platform to track diverse urban infrastructure such as benches, playgrounds, bike racks, public toilets, water fountains, and other city amenities.

#### Tasks

##### Backend Refactoring

- [ ] **Abstract Base Object Model** - Create generic city object schema with shared fields
- [ ] **Object Type System** - Define enumeration/taxonomy for different object types
- [ ] **Type-Specific Fields** - Implement polymorphic fields based on object type
- [ ] **Migration Strategy** - Plan and execute migration of existing containers to new system
- [ ] **API Endpoints** - Refactor endpoints to support multiple object types
- [ ] **Admin UI Updates** - Update Payload CMS collections for object type management

##### Mobile App Updates

- [ ] **Object Type Selection** - UI for choosing object type when adding new objects
- [ ] **Type-Specific Forms** - Dynamic forms based on selected object type
- [ ] **Map Markers** - Different icons/colors for different object types
- [ ] **Filtering by Type** - Allow users to filter map view by object type
- [ ] **Object Type Cards** - Tailored detail views for different object types

#### Object Type Selection Dialog — UI Pattern (Design Decision)

**Pattern: Categorized bottom sheet** (not a grid or wizard).

Spec:

- Triggered by '+' FAB (Floating Action Button) on the map — #2F54C5, 56px, positioned bottom-right
- Bottom sheet slides up; partial reveal (~60% screen height), drag to dismiss
- Header: "Избери вид обект" (Sofia Sans SemiBold, 17px)
- Grouped list rows: 56px height, left icon (24px, outlined style, NOT colored circles), label (Sofia Sans 16px), brief description (muted, 12px)
- Groups: "Инфраструктура" / "Зелени площи" / "Градско обзавеждане"
- Selected item: #2F54C5 accent left border (3px) + light blue background (#EEF2FF)
- **No icon-in-colored-circles pattern** — this is an AI slop red flag for this app type

**Map object type markers:**

- Each type gets a distinct icon (NOT distinct colors for primary differentiation — color-blind accessible)
- Use shape/icon differentiation first, color as secondary signal
- Containers: existing bin icon; Benches: bench SVG; Playgrounds: swing; Bikes: bicycle rack; Fountains: water drop
- All markers share the same base style (DESIGN.md border radius + shadow) but different icons

#### Technical Considerations

- Database schema design for polymorphic objects (single table vs. table-per-type)
- Backward compatibility with existing container data
- Type registry system for extensibility
- Validation rules per object type
- Icon library for different object types
- Performance impact of filtering with multiple types
- Admin interface for adding new object types without code changes

#### Acceptance Criteria

- System supports at least 5 different object types (containers, benches, playgrounds, bike racks, water fountains)
- Existing container data migrates without loss
- Users can add any supported object type via mobile app
- Map displays different icons for different object types
- Filtering by object type works seamlessly
- Admin can configure new object types through UI
- API maintains backward compatibility

---

### 5. Signal Reporting System

**Repository**: `your-sofia-mobile` (primary), `your-sofia-api` (backend)  
**Priority**: High  
**Status**: In Progress

#### Purpose

Enable citizens to report urban environment issues with photos and metadata, creating actionable signals for city services.

#### Tasks (Mobile)

- [x] **Filter: My Signals vs All Signals** - `signals/index.tsx` has `all`/`mine` pill chips using device ID; filter state persisted per session
- [x] **Signal Creation Form** - `app/(tabs)/new/new-signal.tsx` with live map, camera, container state selector, category selection, and submit to backend
- [x] **Signal Detail View** - `app/(tabs)/signals/[id].tsx` with full signal info, photo viewer, admin notes
- [x] **Container Signal Filter** - `signals/index.tsx` pre-filters by `containerReferenceId` when navigated from WasteContainerCard
- [ ] **Images with Visual Timestamp and Location** - Display contextual information on signal images
- [ ] **Reorder Bulk Upload Form** - Request properties before photo selection for better UX

#### Signal Creation Flow — Step Sequence (Design Decision)

Confirmed step order (do not change without design review):

1. **Location confirmation** — GPS pre-fills location, user confirms or adjusts pin on map
2. **Signal type/category** — Tap selection (no typing), contextual to confirmed location
3. **Description** — Optional free text, positioned after category so user has context
4. **Photo(s)** — One or more photos; optional but encouraged; captured or from gallery
5. **Review + submit** — Summary of all entered data before final submission

**Hierarchy per step:**

- Step 1: Map (large, full-width) → address label → "Confirm location" CTA → "Adjust pin" link
- Step 2: Category grid (2-column, icon + label) → "Other" at end
- Step 3: Text area → character count → "Skip" link (description is optional)
- Step 4: Camera button (primary) → gallery picker (secondary) → "Skip" link → photo thumbnails row
- Step 5: Summary card (location + category + description + photos) → "Submit" CTA → "Back" link

#### Tasks (Backend)

- [ ] **Remove Localization** - Simplify signal structure by removing confusing localization
- [ ] **Anonymous User Restrictions**:
  - [ ] Distance restriction: Prevent signals for objects >20m away
  - [ ] Rate limiting: Maximum 5 signals per day for anonymous users

#### Anonymous User Restrictions — UI (Design Decision)

**Distance restriction UX:** Live distance badge on the map (Option C).

- Show "X м от вас" badge on each city object marker (JetBrains Mono font, small)
- Color-coded: green (≤20m), yellow (15-20m), red (>20m)
- "Сигнализирай" (Report) button is disabled when >20m, tooltip: "Трябва да сте до 20м от обекта"
- "N/5 сигнала днес" counter visible to anonymous users on the signals tab header

**Location permission denied UX (affects Signals + Container form):**

- Show inline yellow banner above map: "Твоята София няма достъп до местоположението ви."
- Banner includes: "Отвори настройки" (Open settings) link + "Постави ръчно" (Place manually) CTA
- Map remains interactive — user can drag pin to place location manually
- GPS-reliant features degrade gracefully to manual pin; no feature is blocked entirely

#### Related Features

- [ ] **Link to Assignment System** - Signalled objects feed into "Batman assignment" workflow

#### Signal Submission — Success Moment (Design Decision)

**After successful signal submission:** Full-screen acknowledgment (not just a toast).

Screen content:

- Animated checkmark (gold `#E0B340`, ~60px)
- Headline: "Сигналът ви е приет от Община София." (Sofia Sans Bold, 22px)
- Signal ID in JetBrains Mono (small, muted): "Сигнал #XXXXXX"
- Subtext: "Ще бъдете уведомени при промяна на статуса." (if push enabled)
- **"Виж сигналите ми"** (View my signals) — secondary action
- **"Сподели"** (Share) — secondary action, generates deep link
- **"Затвори"** (Close/X) — returns to map with signal pin visible at submitted location

Emotional intent: The citizen feels HEARD by the city. The signal ID makes it feel official, not a void. The share action creates social proof for civic engagement.

#### Technical Considerations

- **Pagination: Payload native offset (page/limit), 20 per page** — FlatList `onEndReached` trigger; no custom endpoint needed
- Implement geospatial distance validation
- **Rate limiting: PostgreSQL-based** (no Redis) — `signal_attempts(device_id, date, count)` table; no new infra
- **Anonymous user ID: `expo-secure-store` device ID** — more stable than IP, but resets on iOS reinstall; this rate limit is a UX friction heuristic, not a hard fraud gate
- **Rate limit gate timing:** Check on 'Report' button tap (before form opens). If at 5/5, disable the button with count shown: "5/5 сигнала днес". Server-side validation still runs on submit (defense in depth).
- Client-side distance check = UX only (badge, disabled button); server-side validation is the authoritative gate
- **Security gate principle:** All security-sensitive validations must be enforced server-side. Client-side checks are UX only, never the sole gate.
- State management for filters (React Context/Redux)
- Optimistic UI updates
- Clear error messaging for restrictions

#### Security Tests — Required in Phase 1 (minimum bar, not deferred)

- `anonymousRateLimit` middleware: count < 5 → allow; count = 5 → 429; missing device_id → 400
- `distanceCheck` helper: within 20m → allow; outside 20m → 400; invalid coords → 400
- Signal creation endpoint integration test: anonymous at 3/5 count + valid distance → success

#### Acceptance Criteria

- Users can filter between personal and all signals
- Bulk upload asks for metadata first
- Anonymous users respect distance and rate limits
- Signal lifecycle clearly communicated
- Signals appear in assignment system

---

### 6. Assignment & Work Management

**Repository**: `your-sofia-mobile`  
**Priority**: Medium  
**Status**: In Progress

#### Purpose

Create a work assignment system for city operators and inspectors to manage waste collection and maintenance based on citizen signals.

#### Tasks

- [x] **Assignment Interface** - `app/(tabs)/assignments.tsx` (982 lines): FlatList of assignments with status badges (pending/in-progress/completed), create-assignment modal with container selection, title, description, and operator assignment
- [x] **Assignment Status Display** - Status badges with text labels (color-blind safe), progress percentage per assignment
- [x] **Container + Signal Context** - Assignment creation pre-loads containers with active signals (`fetchContainersWithSignals`)
- [ ] **Smart Container Selection** - Algorithm to select most signaled containers for collection
- [ ] **Filters** - Container type, work type, location
- [ ] **Role System** - Operators and Inspectors roles
- [ ] **Pending Reviews Form** - Inspectors review completed work
- [ ] **Completion Workflow** - Operators mark work as complete with photos
- [ ] **Assignment History** - Audit trail and analytics

#### Assignment Interface — AI Slop Guard

**This is an APP UI, not a marketing page.** Apply App UI design rules:

- Dense but readable layout; operators need data density (many assignments on one screen)
- **No dashboard card mosaics** — assignments are a LIST, not a grid of widgets
- No decorative gradients or ornamental icons
- Section headings state status: "Неразпределени (12)", "Моите задания (3)", "Приключени днес (8)"
- Status badges use text, not just color (color-blind safe): "Изчаква" (Pending), "В изпълнение" (In Progress), "Приключено" (Done)
- Assignment row hierarchy: container address (primary) → type + signal count → assigned to (secondary) → status badge (right)

### 7. User Management & Roles

**Repository**: `your-sofia-api` (primary), `your-sofia-mobile` (UI)  
**Priority**: Medium  
**Status**: In Progress

#### Purpose

Implement role-based access control system to enable proper permissions for different user types and ensure data quality through anonymous user restrictions.

#### Tasks

##### Roles & Permissions

- [x] **Auth Screens** - `app/auth/login.tsx` and `app/auth/register.tsx` with validation, error states, a11y props
- [x] **AuthContext** - `contexts/AuthContext.tsx` with `isAuthenticated`, `isContainerAdmin`, `user`, `login`, `logout`
- [x] **ContainerAdmin Role** - `isContainerAdmin` check in profile and WasteContainerCard (edit/clean buttons gated)
- [ ] **Inspector Role** - Define permissions for quality control personnel
- [ ] **Operator Role** - Define permissions for field workers
- [ ] **Role Assignment Interface** - Admin UI for role management
- [ ] **API Middleware** - Role-based access control enforcement
- [ ] **Payload CMS Access Control** - Update collection-level permissions

##### Anonymous User Restrictions

- [ ] **Distance Restriction** - Prevent signals for objects >20m away (anonymous users)
- [ ] **Rate Limiting** - Maximum 5 signals per day for anonymous users
- [ ] **Rate Limiting Middleware** - Implement tracking and enforcement
- [ ] **Clear Error Messages** - User-friendly feedback for restrictions

#### Technical Considerations

- Payload CMS built-in access control
- Geospatial queries for distance validation
- **Rate limiting: PostgreSQL-based** (`signal_attempts` table per device ID + date)
- **Anonymous user identification: `expo-secure-store` device ID** (not IP) — register on first app open
- JWT token role claims
- Clear permission documentation

#### Acceptance Criteria

- Inspector and Operator roles function with appropriate permissions
- Anonymous users have clear limitations enforced
- Registered users have appropriate access levels
- Rate limiting works reliably
- Distance validation accurate

---

### 8. DevOps & Infrastructure

**Repository**: Both  
**Priority**: Medium  
**Status**: In Progress

#### Purpose

Automate deployment, improve developer experience, and ensure production readiness.

#### Tasks

- [x] **Agent Skills** - `your-sofia-mobile/.agents/skills/` and `your-sofia-api/.agents/skills/` populated with domain-specific skill files for Payload, Expo, React Native
- [ ] **Expo GitHub Integration** - Auto-build and publish on releases
- [ ] **Apple Registration** - Complete App Store setup
- [ ] **Kubernetes Implementation** - Container orchestration for production
- [ ] **Email Server Configuration** - Transactional emails for notifications
- [ ] **Simplify Issue Creation** - Templates and automation
- [ ] **AI-Guided Refactoring** - Apply AI agent recommendations

#### Technical Considerations

- EAS (Expo Application Services) for builds
- GitHub Actions workflows
- Kubernetes manifests and Helm charts
- Email service provider (SendGrid, AWS SES, etc.)
- Issue templates for GitHub

#### Acceptance Criteria

- Mobile app builds automatically on release
- App Store and Play Store submission ready
- Production deployment automated
- Email notifications functional
- Contributor experience improved

---

### 9. Testing & Quality Assurance

**Repository**: Both  
**Priority**: Medium  
**Status**: Partial Coverage (44 tests passing)

#### Purpose

Ensure reliability, catch regressions, and maintain code quality through comprehensive testing.

#### Tasks

##### Backend Tests (`your-sofia-api`)

- [ ] **Unit Tests** - Core business logic (signals, containers, users)
- [ ] **Integration Tests** - API endpoints with database
- [ ] **Authentication Tests** - Role-based access control
- [ ] **Geospatial Tests** - Distance calculations and queries

##### Frontend Tests (`your-sofia-mobile`)

- [x] **Component Tests** - `NewsCard` (5 a11y assertions), `AirQualityCard` (status-as-text assertions)
- [x] **Hook Tests** - `useDeviceHeading`, `useSubscription`
- [x] **Lib Tests** - `formatLocationFilter`
- [ ] **Integration Tests** - User flows (create signal, view containers)
- [ ] **E2E Tests** - Critical paths with Detox or similar
- [ ] **Snapshot Tests** - UI consistency

#### Technical Considerations

- Jest for unit and integration tests
- React Native Testing Library
- Detox for E2E testing
- Test databases with seed data
- CI/CD integration

#### Acceptance Criteria

- > 80% code coverage for core functionality
- All critical user flows tested
- Tests run automatically in CI/CD
- Clear testing documentation

---

## Implementation Priority Matrix

### Phase 1: MVP Enhancement (Immediate)

1. ~~News & Notifications - Complete push notifications and rich text~~ **RichText ✅, Push Notifications ✅, Subscription system ✅** — remaining: Bell icon modal summary
2. Container Management - ~~Edit form ✅~~ Remaining: creation flow, Google Maps navigation, location adjust
3. Signal System - ~~My/All filter ✅, Signal form ✅~~ — remaining: image timestamp overlay, backend anonymous restrictions
4. Backend - ~~Location migration to PayloadCMS Point~~ **DONE** — `WasteContainers.location` is already `type: 'point'`; remaining backend task is Admin UI Map Integration

### Phase 2: Work Management (Next)

5. Multi-Type City Objects - Refactor backend to polymorphic schema; adapt container components
6. Assignment System - Build complete workflow

## Design Decisions — Resolved (Pass 7)

The following decisions were deferred or ambiguous and are now resolved.

### Signals Filter Default

**Default view on Signals tab:** "Всички сигнали" (All signals) — pre-selected on first open.

- Uses `TopicFilter.tsx` pill pattern: "Всички" (selected, #2F54C5) | "Мои" (unselected)
- Filter state persisted per session (not reset on each app visit)
- If user has 0 personal signals and switches to "Мои": show empty state (not an empty list)

### Dark Mode

**Light mode only for Phase 1.** Dark mode explicitly deferred.

- In `app/_layout.tsx` or root: add `useColorScheme` override to force light mode
- Document in CONTRIBUTING.md as a known gap
- DESIGN.md dark palette to be designed before dark mode implementation

### Icon Library

**Lucide** (`lucide-react-native`) — single source of truth for all icons.

- Install: `pnpm add lucide-react-native`
- Do NOT mix with Expo Vector Icons (Ionicons, MaterialIcons, etc.)
- Icon size standard: 20px navigation/labels, 24px primary actions, 16px inline/tags
- Stroke width: 1.5 (default) for regular UI; 2.0 for emphasis (primary actions)

### Map Performance (1000+ markers)

- Progressive loading: visible viewport markers first; skeleton overlay while loading
- Cluster markers at zoom < 14: show count badge
- Debounce map region change: 300ms before fetching new marker bounds

### Signal Image Timestamp/Location Overlay

- Overlay: semi-transparent black pill, bottom-left of image
- Content: date in JetBrains Mono (short: "27 апр. 2026") + address or coordinates
- Coordinates: JetBrains Mono 10px; address (geocoded): Sofia Sans 11px

### Anonymous vs Registered UX

- Same visual interface; gates surface only when user hits a restriction
- NOT a login gate: anonymous users browse freely
- Registration CTA only shown when anonymous user hits a restriction
- CTA: "Регистрирайте се, за да подавате неограничен брой сигнали."

## Accessibility Requirements — WCAG 2.1 AA Baseline

This is a Sofia Municipality public app. EU Web Accessibility Directive applies. All Phase 1 features must meet WCAG 2.1 AA before shipping.

### Non-negotiable requirements (implement during development, not after)

**Touch targets:**

- Minimum 44×44px for all interactive elements (iOS/Android HIG)
- Spacing between tap targets: minimum 8px
- Map markers: minimum 44×44px hit area (even if visual is smaller)

**Color contrast:**

- Body text (≤18px regular or ≤14px bold): minimum 4.5:1 contrast ratio
- Large text (>18px regular or >14px bold): minimum 3:1
- DESIGN.md primary `#2F54C5` on white: passes AA ✓
- DESIGN.md gold `#E0B340` on white: FAILS — use only for decorative elements, NOT body text

**Screen reader (React Native `accessible` props):**

- Core journeys requiring screen reader compatibility: News reading, Signal creation, Notification center
- All interactive elements: `accessibilityLabel` + `accessibilityRole`
- Images: `accessibilityLabel` or `accessibilityRole="image"` with description
- Status badges: `accessibilityLabel` includes status text (not just visual color)
- Map markers: `accessibilityLabel` = "{object type} {address}" with `accessibilityHint`

**Form accessibility:**

- Field labels always visible (never placeholder-as-label — labels above the field)
- Error messages: `accessibilityLiveRegion="polite"` on error containers
- Multi-step forms: announce step progress ("Стъпка 2 от 5") via `accessibilityLiveRegion`

**Bilingual accessibility:**

- `accessibilityLanguage` set on text elements where language is explicit (bg/en)

### Responsive (mobile-only app, still needs to handle)

- Minimum supported: iPhone SE (375px wide) and equivalent Android
- Large text / display accessibility scaling: layouts must not break at font scale 1.4x
- Landscape mode: map screens must be usable in landscape; form screens can lock portrait

All Phase 1 features must use DESIGN.md tokens. This section is the canonical source for implementers.

### Typography

- All UI labels, headings, body text: **Sofia Sans** (Regular 400 / SemiBold 600 / Bold 700)
- All numeric data (coordinates, distances, signal IDs, timestamps, counts): **JetBrains Mono**
- Minimum body text: 16px; minimum label: 14px

### Colors

- Primary action buttons: `#2F54C5` bg, white text
- Primary dark (pressed/active states): `#082E8E`
- Primary light (hover tints, selection backgrounds): `#5078F0`
- Gold accent (pending states, highlights, success moments): `#E0B340`
- Gold light background (warning banners, pending badges): `#FEF3C0`
- White background: `#FFFFFF`
- Error color: standard red (`#EF4444`)

### Map Marker Colors — Design Decision

All marker types use DESIGN.md palette (brand-first, icon-differentiated). **No semantic colors per object type.**

- Type differentiation: icon shape only (bin icon ≠ bench icon ≠ playground icon)
- Status differentiation (primary signal on map): tint only
  - Active/normal: `#2F54C5` (primary blue)
  - Pending approval: `#E0B340` (gold)
  - Damaged/reported: `#EF4444` (red)
  - Assigned/in-progress: `#082E8E` (primary dark)
- Color-blind safe: shape is always the primary differentiator, color is secondary

### Spacing & Sizing

- Base grid: 8px — all spacing is multiples of 8px
- Page margins: 16px
- Touch targets: minimum 44×44px (iOS/Android HIG)
- Form inputs: 48px height minimum

### Border Radius

- Tags / badges: 6px
- Buttons / inputs / form fields: 10px
- Cards (NewsCard, WasteContainerCard, etc.): 12px
- Pills (category filters, status badges): 9999px

### Components to Reuse (do not reinvent)

- `NewsCard.tsx` — established card pattern with DESIGN.md tokens
- `WasteContainerCard.tsx` — established container card
- `WasteContainerMarker.tsx` — marker base; extend for other object types
- `TopicFilter.tsx` — filter pill pattern; reuse for "My Signals / All Signals" filter
- `TabHeader.tsx` — tab navigation header

### Journey: Citizen Reports a Signal (Primary Flow)

| Step                    | User Does                     | User Feels                    | Design Supports It                                                      |
| ----------------------- | ----------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| 1. Opens app            | Taps app icon                 | Curiosity, habit              | News feed loads instantly (skeleton, then content)                      |
| 2. Navigates to map     | Taps map tab                  | Spatial context, recognition  | Map centers on user location; familiar city streets                     |
| 3. Spots a problem      | Sees overflowing bin          | Frustration, civic duty       | Live distance badge ("15 м от вас") signals reportability               |
| 4. Taps Report          | Taps "Сигнализирай" on marker | Anticipation, slight friction | Location confirmation screen: map + GPS pre-fill = instant confirmation |
| 5. Selects category     | Taps "Препълнен контейнер"    | Competence, clarity           | 2-column grid with clear icons; correct choice obvious in <2 seconds    |
| 6. Adds description     | Types brief note (optional)   | Mild effort                   | Textarea with skip link; character count shows 280-char limit           |
| 7. Takes/attaches photo | Camera tap or gallery         | Mild effort                   | Full-width preview after capture; retake available                      |
| 8. Reviews and submits  | Taps Submit                   | Commitment, slight anxiety    | Summary card with all info visible; "Edit" links per section            |
| 9. Sees success screen  | Full-screen acknowledgment    | Relief, civic pride           | Gold checkmark + signal ID + "the city received your report"            |
| 10. Returns to map      | Taps Close                    | Satisfaction                  | Signal pin appears immediately on map at reported location              |

### Journey: First-Time User (What's New Splash)

| Step                 | User Does                 | User Feels                | Design Supports It                                          |
| -------------------- | ------------------------- | ------------------------- | ----------------------------------------------------------- |
| 1. Opens updated app | App launches              | Curiosity                 | Splash screen, NOT a login gate                             |
| 2. Reads what's new  | Scans 3-4 feature bullets | Interest, mild impatience | Short bullets, no paragraph prose; skip link always visible |
| 3. Taps Continue     | Taps "Напред"             | Readiness                 | Full-width primary CTA, impossible to miss                  |

### Journey: Citizen Finds Empty Signals List

| Step                   | User Does                | User Feels     | Design Supports It                                              |
| ---------------------- | ------------------------ | -------------- | --------------------------------------------------------------- |
| 1. Opens Signals tab   | First visit              | Expectation    | Skeleton loads first (shows the interface is working)           |
| 2. Sees empty state    | No signals yet           | Mild confusion | Illustration (not a blank screen) + "Няма сигнали в тази зона." |
| 3. Sees primary action | Reads "Подай сигнал" CTA | Comprehension  | The empty state IS the onboarding for signal submission         |

## Interaction State Matrix — Phase 1

All Phase 1 features must implement these states before shipping. "No items found." is not a design — every empty state needs warmth, a primary action, and context.

| Feature                      | Loading                                           | Empty                                                          | Error                                             | Success                                                                       |
| ---------------------------- | ------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| News feed                    | Skeleton cards (3×, matching NewsCard dimensions) | Illustration + "Няма новини в момента." + "Опресни" button     | "Проблем при зареждане." + retry button           | —                                                                             |
| Signals list                 | Skeleton rows                                     | Illustration + "Все още няма сигнали." + "Подай сигнал" CTA    | Error banner + retry                              | —                                                                             |
| My Signals filter            | Skeleton                                          | Illustration + "Нямате подадени сигнали." + "Подай сигнал" CTA | Same as signals list                              | —                                                                             |
| Container form submit        | Spinner on Submit button, button disabled         | —                                                              | Inline field errors (red text, 12px, below field) | Toast: "Контейнерът е добавен успешно." + map zoom to new pin                 |
| Signal form submit           | Spinner on Submit button                          | —                                                              | Inline field errors + banner for network errors   | Full-screen success: checkmark + "Сигналът е изпратен!" + share/close options |
| Map initial load             | Skeleton map tiles + "Зареждане..." label         | "Няма обекти в тази зона." (only if explicit zoom/filter)      | Error banner over map + retry                     | —                                                                             |
| Notifications                | Skeleton rows                                     | Bell illustration + "Нямате известия."                         | Error banner + retry                              | —                                                                             |
| Push notification permission | System prompt (iOS/Android native)                | —                                                              | "Известията са изключени." + settings link        | "Известията са включени." toast                                               |

**Error state principles (per DESIGN.md):**

- Network errors: yellow banner (gold light bg `#FEF3C0`, gold border `#E0B340`), dismissible
- Validation errors: red inline text below each field, field border turns red
- GPS errors: inline yellow banner (above map) with manual fallback CTA
- Success confirmations: green toast (bottom of screen), auto-dismiss after 3s, or full-screen for critical actions (signal submitted)

**Pending approval state (new containers):**

- Container card shows "Изчаква одобрение" badge (gray bg, muted text)
- Not shown on public map until approved by admin
- Creator sees it in their profile with pending badge

6. Assignment System - Build complete workflow
7. User Roles - Inspector and Operator permissions
8. Map Enhancements - Object addition flow

### Phase 3: Engagement & Scale (Future)

9. DevOps - Kubernetes and automation
10. Testing - Comprehensive coverage

---

## Dependencies & Blockers

### Critical Dependencies

- **Multi-Type City Objects Refactoring** (Backend) → Blocks adding non-container objects
- ~~**Container Location Migration** (Backend)~~ → **DONE** — `WasteContainers.location` field is `type: 'point'`; remaining blocker for map editing is Admin UI Map Integration
- **Role System** (Backend) → Blocks assignment system
- **Anonymous User Restrictions** (Backend) → Prevents spam signals

### External Dependencies

- Apple Developer Program enrollment
- Email service provider selection
- Kubernetes cluster setup

---

## Contributor Guidelines

### Getting Started

1. Review relevant README files in each repository
2. Check existing issues for the feature you want to work on
3. Comment on the issue to claim it
4. Follow contribution guidelines in CONTRIBUTING.md

### Code Standards

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Meaningful commit messages
- Tests for new features
- Bilingual support (Bulgarian/English)

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback

---

## Questions or Suggestions?

Open an issue in the respective repository or join our community discussions!

**Repository Links:**

- Mobile: https://github.com/sofia-municipality/your-sofia-mobile
- API: https://github.com/sofia-municipality/your-sofia-api

---

## NOT In Scope — Phase 1

Explicitly deferred with rationale:

| Feature                                           | Rationale                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| Dark mode                                         | DESIGN.md has no dark tokens; force light mode until tokens exist            |
| Multi-Type City Objects schema migration          | High blast radius; deferred to Phase 2 to avoid blocking Phase 1 mobile work |
| Offline signal submission queue                   | Requires retry/queue infrastructure; deferred — not a launch blocker         |
| Cross-platform desktop                            | Native mobile only                                                           |
| Admin UI redesign                                 | Payload admin UI is staff-facing; not a citizen app concern                  |
| Push notification APNS/FCM cert management        | Infrastructure/DevOps scope; tracked separately in Epic 8                    |
| Signal lifecycle notifications ("status changed") | Requires Assignment System (Phase 2); tracked in TODOS.md                    |

---

## What Already Exists — Reuse, Don't Rebuild

| Existing artifact                      | Where used in Phase 1         | Status                                      |
| -------------------------------------- | ----------------------------- | ------------------------------------------- |
| `components/NewsCard.tsx`              | Epic 1: News feed             | Reuse; extend for new hierarchy spec        |
| `components/WasteContainerCard.tsx`    | Epic 3: Container list        | Reuse; extend for pending approval badge    |
| `components/WasteContainerMarker.tsx`  | Epic 2/3: Map markers         | Reuse as base; add distance badge overlay   |
| `components/TopicFilter.tsx`           | Epic 5: My/All signals filter | Reuse as-is                                 |
| `components/TabHeader.tsx`             | All tabs                      | Reuse as-is                                 |
| `components/FullScreenPhotoViewer.tsx` | Epic 3/5: Photo viewing       | Reuse as-is                                 |
| `contexts/AuthContext.tsx`             | Epic 7: User roles            | Extend for role claims (Inspector/Operator) |
| `lib/payload.ts`                       | All epics                     | Extend with signal/container/push endpoints |
| `hooks/useNews.ts`                     | Epic 1                        | Extend with pagination                      |
| `hooks/useWasteContainers.ts`          | Epic 3                        | Extend with pagination + bounding box       |
| `i18n.ts` + `translations/bg.ts`       | All epics                     | All new strings added in Bulgarian first    |

---

## Parallelization Strategy — Phase 1

| Step                                                   | Modules touched                                                                  | Depends on                             |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------- |
| Epic 1: News mobile (RichText, What's New, Bell modal) | `app/(tabs)/`, `components/`, `hooks/`                                           | —                                      |
| Epic 1: Push notifications                             | `lib/payload.ts`, `contexts/`, API `collections/PushTokens`                      | —                                      |
| Epic 3: Container form mobile                          | `forms/`, `app/(tabs)/`, `hooks/useWasteContainers.ts`                           | —                                      |
| ~~Epic 3: Location migration (backend)~~               | ~~DONE — `type: 'point'` is native Payload; `WasteContainers` already migrated~~ | —                                      |
| Epic 5: Signal form + filter mobile                    | `app/(tabs)/`, `forms/`, `hooks/`                                                | —                                      |
| Epic 5/7: Anonymous restrictions (backend)             | `src/endpoints/`, `src/middleware/`, PostgreSQL `signal_attempts`                | —                                      |
| Epic 2: Map clustering spike                           | `app/(tabs)/map`, `react-native-map-clustering`                                  | Spike result determines library choice |

**Lane A (independent, run in parallel):**  
`Epic 1 News mobile` → `Epic 1 Push notifications` (sequential, share PushTokens API)

**Lane B (independent, run in parallel):**  
`Epic 3 Container form mobile`

**Lane C — REMOVED:** Epic 3 location migration (backend) is already done.

**Lane D (independent, run in parallel):**  
`Epic 5 Signal form mobile` → `Epic 5/7 Anonymous restrictions backend` (backend must ship first)

**Lane E (independent, run in parallel):**  
`Epic 2 Map clustering spike` → implement based on spike result

**Execution:** Launch Lanes A/B/C/E in parallel. Lane D starts Epic 5 mobile after backend restrictions are ready (or use feature flag to defer the restriction UI until backend ships). No merge conflicts — lanes touch different directories.

**Conflict flag:** Lane A (Push notifications, `lib/payload.ts`) and Lane D (Signal form, `lib/payload.ts`) both extend the API client. Coordinate to avoid merge conflicts in `lib/payload.ts`.

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                       | Runs | Status      | Findings                                    |
| ------------- | --------------------- | ------------------------- | ---- | ----------- | ------------------------------------------- |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy          | 0    | —           | —                                           |
| Codex Review  | `/codex review`       | Independent 2nd opinion   | 0    | —           | —                                           |
| Eng Review    | `/plan-eng-review`    | Architecture & tests      | 1    | issues_open | 7 decisions, 26 test gaps, 2 critical paths |
| Design Review | `/plan-design-review` | UI/UX gaps                | 1    | issues_open | score: 2/10 → 7/10, 8 decisions             |
| DX Review     | `/plan-devex-review`  | Developer experience gaps | 0    | —           | —                                           |

**UNRESOLVED:** 2 (dark mode palette, offline signal submission queue)
**VERDICT:** Design + Eng reviews complete. CEO review optional for scope validation.
