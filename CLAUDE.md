# PulseFlow Suite
Premium role-aware EC project progress dashboard for KIPL with admin onboarding, client-code login, process tracking, analytics, alerts, dark mode, and responsive SaaS navigation.

## Masterplan
- Give KIPL admins a polished workspace to create, edit, delete, and monitor client EC projects across a local portfolio.
- Give clients a restricted self-service dashboard using a generated Client Code; clients only see their own project.
- Replace spreadsheet-style reporting with metric cards, status badges, progress bars, owner filtering, alert cards, and lightweight CSS analytics.
- Surface EC process risk quickly through overdue/upcoming detection from step due dates.
- Keep deployment static and simple: no build step, no app backend database; project/session/theme data persists in browser `localStorage`.

## Tech Stack & Architecture
- **Runtime:** Static browser app loaded from `index.html`; no bundler, build step, or package manager required.
- **React:** React `19.2.0` and ReactDOM from `https://esm.sh`.
- **Routing:** `react-router-dom@7.13.0` with `HashRouter` in `src/App.js`, so deep routes work on static hosting.
- **Templates:** No JSX compilation. Components import `html` from `src/jsx.js`, which binds `htm` to `React.createElement`.
  - Use ``html`<${Component} prop=${value} />` ``.
  - Do not add raw JSX unless a build pipeline is introduced.
- **Styling:** Tailwind CDN in `index.html` plus custom HSL theme tokens/utilities in `styles/main.css`.
  - Components use Tailwind arbitrary values like `bg-[hsl(var(--card))]`.
  - Shared classes include `card`, `card-hover`, `skeleton`, `focus-ring`, and `animate-rise`.
- **Icons:** `lucide-react` via esm.sh imports in UI components/pages.
- **Authentication:** GenMB auth SDK is injected directly in `index.html` as `window.genmb.auth`.
  - Admin login: `src/pages/Login.js` calls `sendAdminLink()` from `src/mainProviders.js`.
  - Admin validation requires code `ADMIN@KESARI001` and email domain `@kesariprojects.com`, then sends a GenMB magic link.
  - Client login is local-only: entered Client Code is matched against projects in `localStorage`.
- **State:** Single app context in `src/mainProviders.js`.
  - `ec-kipl-projects`: project list.
  - `ec-kipl-session`: current Admin/Client session.
  - `ec-kipl-theme`: dark/light mode.
  - `ec-kipl-owners`: known project owners.
- **Data model source:** `src/data/sampleData.js` defines the fixed 20-step EC workflow, status options, seeded project `YRBH03`, and `createSteps()`.
- **Derived data:** `src/utils/metrics.js` computes progress, status counts, step progress, status colors, overdue tasks, and upcoming tasks synchronously from project steps.
- **Charts:** `src/pages/Analytics.js` uses custom HTML/CSS charts, including conic-gradient donut and progress bars. There is no charting library.
- **Composition:** `src/main.js` mounts `<Providers><App /></Providers>`. `src/App.js` guards all routes except `/login`. `src/components/Layout.js` renders `Sidebar`, sticky `Header`, and nested `<Outlet />`.

## File Structure
```txt
index.html                    # Static entry; Tailwind CDN, styles/main.css, GenMB auth SDK, src/main.js module
styles/main.css               # HSL theme tokens, dark variables, card/skeleton/focus/animation utilities

src/main.js                   # React root mount into #root
src/jsx.js                    # htm binding; required for all component templates
src/mainProviders.js          # Global context: auth boot, localStorage persistence, project/step CRUD
src/App.js                    # HashRouter routes, auth Guard, app route map, redirects

src/components/Layout.js      # Responsive shell: fixed sidebar area, sticky header, main outlet
src/components/Header.js      # Top bar: menu, app/project title, theme toggle, role pill, logout
src/components/Sidebar.js     # Fixed/collapsible nav; hides Clients unless Admin
src/components/UI.js          # Shared PageTitle, Badge, ProgressBar, EmptyState, SkeletonCards

src/data/sampleData.js        # Fixed EC process steps, status options, seed project, createSteps()
src/utils/metrics.js          # Metric helpers, overdue/upcoming logic, status tone mapping

src/pages/Login.js            # Admin magic-link request and local Client Code login
src/pages/Dashboard.js        # Portfolio/project dashboard with metric cards and project navigation
src/pages/Clients.js          # Admin-only project creation/edit/delete and portfolio cards
src/pages/ProcessTracker.js   # Step table, status/date/remarks editing, Data Collation accordion
src/pages/Analytics.js        # Metric cards, donut progress chart, status breakdown bars
src/pages/Alerts.js           # Overdue/upcoming alert cards scoped by project or portfolio
src/pages/NotFound.js         # Fallback route card
CLAUDE.md                     # Project documentation for AI coding agents
```

## Key Features
### Role-aware login
- `/login` shows two login modes:
  - Admin: requires admin code plus KIPL email domain, then sends GenMB magic link.
  - Client: requires a matching project `code`; creates `{ role: 'Client', code, name }` session locally.
- `src/App.js` `Guard` blocks all app routes until `authReady`; unauthenticated users redirect to `/login`.
- Admin sessions can be restored from GenMB auth state only if email ends with `@kesariprojects.com`.

### Project model
Projects are persisted in `ec-kipl-projects` and normalized in `mainProviders.js`.

```js
{
  code: 'YRBH03',
  clientName: 'Bhumi Homes',
  projectOwner: 'Chinmay',
  mepInitial: 'YR',
  architectInitial: 'BH',
  projectName: 'Bhumi Heights EC',
  location: 'Mumbai',
  projectDetails: '',
  startDate: '',
  endDate: '',
  createdAt: '2026-05-01',
  steps: [...]
}
```

- Client Codes are generated in `generateCode(projects, mep, architect, client)`:
  - Base: uppercase MEP + architect + first 2 client chars.
  - Serial starts from `projects.length + 3`.
  - Codes are de-duped case-insensitively.
- `updateProject()` intentionally preserves existing `code`; client codes are locked after creation.
- `deleteProject()` removes the project from local storage on next persistence effect.

### EC step model
`createSteps()` creates 20 fixed EC process steps from `PROCESS_STEPS`.

```js
{
  id: 'step-4',
  srNo: 4,
  activity: 'Data Collation  from Client, MEP and Architect',
  responsibility: 'Client, MEP and Architect',
  status: 'In Progress',
  startDate: '2026-05-04',
  endDate: '',
  remarks: '',
  collation: [
    { name: 'Architect Data', status: 'Not Started', startDate: '', endDate: '', remarks: '' },
    { name: 'MEP Data', status: 'Not Started', startDate: '', endDate: '', remarks: '' },
    { name: 'Client Data', status: 'Not Started', startDate: '', endDate: '', remarks: '' }
  ]
}
```

- Status options are `Not Started`, `In Progress`, `Completed`, `On Hold`.
- `Data Collation` is special: only step 4 has `collation` sub-steps.
- Step edits use `updateStep(projectCode, stepId, patch)`.
- Collation edits use `updateCollation(projectCode, stepId, name, patch)`; names are identifiers, so do not rename without updating this logic.

### Dashboard
- Admins can see all projects; clients see only their project through `visibleProjects`.
- Project-scoped routes use `/projects/:code`.
- Portfolio-level routes `/process`, `/analytics`, `/alerts` operate on all visible projects.
- Dashboard metrics come from `getMetrics(projects)`:
  - Total Steps
  - Completed Steps
  - Pending Steps
  - Overdue Tasks
  - Overall Progress %

### Clients page
- `src/pages/Clients.js` is Admin-only; non-admin users see an `EmptyState`.
- Admins can:
  - Create projects.
  - Choose existing project owners or add a new owner.
  - Edit project metadata/details/dates/owner.
  - Delete projects after `confirm()`.
  - Open a project folder via `/projects/:code`.
- New projects always receive fresh steps from `createSteps()`.

### Process Tracker
- `src/pages/ProcessTracker.js` is the editable process workspace.
- Requirements to preserve:
  - Clean table with sticky header.
  - Row hover states.
  - Per-row progress indicators via `ProgressBar`.
  - Status badges via `Badge`.
  - Data Collation shown as expandable/card-style sub-step UI.
- For client users, ensure edits remain consistent with role expectations before adding any new write restrictions; current persistence layer supports updates for visible project data.

### Analytics
- `src/pages/Analytics.js` renders:
  - Top metric cards.
  - Donut progress chart: completed vs pending.
  - Bar chart: count of each status.
- Current implementation does **not** include an external chart package or a line chart. If adding the requested timeline insight, implement it with lightweight SVG/CSS or intentionally introduce and document a chart dependency.

### Alerts
- `src/pages/Alerts.js` scopes alerts by route:
  - `/alerts`: all visible projects.
  - `/projects/:code/alerts`: selected project.
- Alert criteria:
  - `isOverdue(step)`: `endDate` exists, status is not `Completed`, and due date is before today.
  - `isUpcoming(step)`: `endDate` exists, status is not `Completed`, and due date is within 0–3 days.
- Cards are red for overdue and yellow for upcoming.
- Empty state copy: “No alerts”.

## Design Guidelines
- Style target: modern premium SaaS, similar to Stripe/Notion/Linear.
- Layout:
  - Fixed left sidebar on desktop (`lg:pl-72` in `Layout.js`).
  - Sidebar drawer with overlay on smaller screens.
  - Sticky translucent top bar with backdrop blur.
  - Main content uses card-based spacing.
- Theme:
  - HSL CSS variables in `styles/main.css`.
  - Dark mode toggled by adding/removing `.dark` on `<html>` in `mainProviders.js`.
  - Use `bg-[hsl(var(--background))]`, `text-[hsl(var(--foreground))]`, `border-[hsl(var(--border))]`, etc.
- Status colors:
  - Completed: `var(--green)`
  - In Progress: `var(--blue)`
  - On Hold / Upcoming: `var(--yellow)`
  - Overdue: `var(--red)`
  - Not Started: `var(--muted)`
- Components should use rounded cards, soft shadows, subtle borders, smooth hover transforms, and transitions.
- Keep tables uncluttered; prefer badges, progress bars, and compact controls over dense text.

## App Flow
1. User lands on `/login`.
2. Admin enters admin code + KIPL email and receives a magic link.
3. Client enters a generated Client Code and is routed to `/projects/:code`.
4. Authenticated users enter `Layout`:
   - Sidebar navigation.
   - Header with project/directory title, dark mode toggle, role indicator, logout.
5. Admin default `/` shows project directory/portfolio context.
6. Client default experience is project-scoped through `visibleProjects`.
7. Project pages:
   - `/projects/:code`: project dashboard.
   - `/projects/:code/process`: process tracker for one project.
   - `/projects/:code/analytics`: analytics for one project.
   - `/projects/:code/alerts`: alerts for one project.
8. Portfolio pages:
   - `/process`, `/analytics`, `/alerts` aggregate all `visibleProjects`.
   - For clients, these still effectively scope to one project.
9. Edge cases:
   - No projects: show “No projects yet” style empty states.
   - No alerts: show “No alerts”.
   - Invalid route: `src/pages/NotFound.js`.
   - Auth boot pending: skeleton block in `Guard`.
   - Corrupt localStorage JSON: `safeGet()` falls back safely.

## Conventions
- Use ESM URL imports exactly like existing files:
  - React: `https://esm.sh/react@19.2.0`
  - Router: `https://esm.sh/react-router-dom@7.13.0?deps=react@19.2.0`
  - Icons: `https://esm.sh/lucide-react?deps=react@19.2.0`
- Every React component file must import `html` from `src/jsx.js`; do not write raw JSX.
- Prefer named exports for components/pages.
- Use `useAppShell()` for shared state/actions; do not create parallel localStorage state outside `mainProviders.js`.
- Use helpers from `src/utils/metrics.js` for counts, progress, alert logic, and status colors. Avoid duplicating status color maps.
- Add shared visual primitives to `src/components/UI.js` only when reused by multiple pages.
- To add a new page:
  1. Create `src/pages/NewPage.js` with an exported component using `html`.
  2. Import it in `src/App.js` and add a guarded `<Route>`.
  3. Add a sidebar item in `src/components/Sidebar.js` if it is top-level navigation.
  4. If it should be project-scoped, add a `projectPath` and ensure route `/projects/:code/new-path` exists.
- To add project fields:
  1. Update project creation/edit forms in `src/pages/Clients.js`.
  2. Update `normalizeProjects()` in `src/mainProviders.js` for backward compatibility with old localStorage.
  3. Render the field in dashboard/cards only after handling missing values.
- To add step fields:
  1. Update `createSteps()` in `src/data/sampleData.js`.
  2. Update `ProcessTracker.js` edit controls.
  3. Consider migration/normalization for existing saved projects, because old localStorage steps will not automatically get new fields.
- Gotcha: `owners` are updated inside project create/update flows via `upsertOwner()`. Because state updates are async, do not rely on the updated `owners` array immediately after calling project mutations.
- Gotcha: Client Code lookup is case-insensitive on login, but stored project codes should remain uppercase and immutable.

## Platform (GenMB)

This app is built and hosted on GenMB.

**Runtime:** Browser sandbox (iframe) or Cloud Run. No Node.js server — all code runs client-side unless `backend/` exists.

**Dependencies:** CDN-only (esm.sh, cdn.tailwindcss.com, unpkg). Use ES module imports with full CDN URLs. No `npm install` at runtime.

**Entry point:** `index.html` must include all CDN script tags. Tailwind via CDN with inline config.

**Built-in services (relative API paths only, never hardcode domains):**
- `/api/ai/completion` — AI proxy | `/api/data/{appId}/*` — PostgreSQL (DataConnect SDK)
- `/api/storage/{appId}/*` — File uploads (GCS) | `/api/auth/google/*` — Google OAuth
- `/api/contact/submit` — Contact form | SDKs: `window.genmb.db`, `.storage`, `.auth`

**File structure:** `index.html` (entry), `src/` (source), `styles/` (CSS), `backend/` (optional FastAPI), `CLAUDE.md` (this file).

**Cannot:** Install npm packages at runtime, access filesystem, make direct server-side calls from frontend, modify infra.
