# Resume Builder — Claude Code Instructions

## Package Manager
Use pnpm for ALL installs. Never use npm or npx.
- Install packages: `pnpm add <package>`
- Run shadcn: `pnpm dlx shadcn@latest add <component>`
- Run scripts: `pnpm dev` / `pnpm build` / `pnpm lint`

## shadcn Config
This project uses a custom shadcn preset. See `components.json` for the exact
theme, base color, CSS variables, and prefix. Do NOT override or reinitialize
shadcn — the preset is already applied. Just add components as needed using:
`pnpm dlx shadcn@latest add <component>`

## Reference Files
Read these files before doing anything else. They are the ground truth for all
functionality, layout, and logic. Do not change any feature — only improve the UI.

@index.html
@dashboard.html
@profile.html
@resume-builder.html
@certificates.html
@seminars.html
@file-manager.html
@styles.css

---

## Tech Stack
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui (custom preset — already initialized, do not reinitialize)
- Fonts: Comfortaa (headings/UI) + Crimson Text (resume body) from Google Fonts
- Auth: DEMO mode — hardcoded credentials, no backend calls
- Storage: sessionStorage key `rb_state` (JSON) — same schema as original
- Future backend: Java with java-jwt for auth, JDBC/JDBI for storage and file management
  (all integration points are commented out with clear TODO markers)

## shadcn Components to Install
```bash
pnpm dlx shadcn@latest add button card input label textarea tabs accordion \
  sheet alert alert-dialog dialog form badge separator table skeleton \
  progress sonner navigation-menu calendar popover
```

---

## Routing (App Router)
```
/                → Landing + Auth (index.html)
/dashboard       → Dashboard (dashboard.html)
/profile         → Profile (profile.html)
/resume-builder  → Resume Builder (resume-builder.html)
/certificates    → Certificates (certificates.html)
/seminars        → Seminars (seminars.html)
/file-manager    → File Manager (file-manager.html)
```
Protect all routes except `/` with a layout-level auth guard that redirects
unauthenticated users to `/`.

---

## File Structure
```
app/
  layout.tsx                  ← root layout, fonts, <Toaster />
  page.tsx                    ← landing + auth (/)
  (app)/
    layout.tsx                ← AppLayout: demo auth guard + sidebar + header
    dashboard/page.tsx
    profile/page.tsx
    resume-builder/page.tsx
    certificates/page.tsx
    seminars/page.tsx
    file-manager/page.tsx
components/
  layout/
    AppSidebar.tsx
    AppHeader.tsx
    AppLayout.tsx
  auth/
    LoginForm.tsx
  resume/
    ResumePreview.tsx
    ResumeHistoryPanel.tsx
  ui/
    empty-state.tsx           ← custom, used everywhere
hooks/
  useAuth.ts
  useAppState.ts
lib/
  auth.ts                     ← demo auth + commented Java backend integration
  storage.ts                  ← sessionStorage state + commented JDBI integration
  resumeHistory.ts            ← history manager logic
  demoFiles.ts                ← demo file manager (metadata only)
  utils.ts                    ← cn(), formatSize(), formatDate()
```

---

## AUTH — Demo Mode

Create `lib/auth.ts`:
```ts
// ── DEMO CREDENTIALS (hardcoded for testing) ─────────────────────────────────
export const DEMO_USER = {
  email: "demo@resumebuilder.com",
  password: "demo123",
  name: "Demo User",
  id: "demo-user-001",
};

export type AuthUser = { email: string; name: string; id: string };

export function getSessionUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem("rb_auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function setSessionUser(user: AuthUser) {
  sessionStorage.setItem("rb_auth_user", JSON.stringify(user));
}
export function clearSessionUser() {
  sessionStorage.removeItem("rb_auth_user");
}
export function demoLogin(
  email: string,
  password: string
): { user: AuthUser | null; error: string | null } {
  if (
    email.trim().toLowerCase() === DEMO_USER.email &&
    password === DEMO_USER.password
  ) {
    const user: AuthUser = {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      id: DEMO_USER.id,
    };
    setSessionUser(user);
    return { user, error: null };
  }
  return { user: null, error: "Invalid email or password." };
}
export function demoLogout() {
  clearSessionUser();
}

/*
 * ── JAVA BACKEND INTEGRATION (uncomment when ready) ──────────────────────────
 *
 * POST /api/auth/login
 *   Body: { email, password }
 *   Returns: { token: string, user: { id, email, name } }
 *   JWT signed with java-jwt (com.auth0:java-jwt).
 *   Store token in sessionStorage as "rb_jwt_token".
 *
 * export async function backendLogin(email: string, password: string) {
 *   const res = await fetch("/api/auth/login", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ email, password }),
 *   });
 *   const data = await res.json();
 *   if (!res.ok) return { user: null, error: data.message };
 *   sessionStorage.setItem("rb_jwt_token", data.token);
 *   setSessionUser(data.user);
 *   return { user: data.user, error: null };
 * }
 *
 * export function getAuthHeaders() {
 *   const token = sessionStorage.getItem("rb_jwt_token");
 *   return token ? { Authorization: `Bearer ${token}` } : {};
 * }
 *
 * export async function backendLogout() {
 *   await fetch("/api/auth/logout", {
 *     method: "POST",
 *     headers: getAuthHeaders(),
 *   });
 *   clearSessionUser();
 *   sessionStorage.removeItem("rb_jwt_token");
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */
```

Create `hooks/useAuth.ts`:
- Reads/writes via `lib/auth.ts` demo functions
- Exposes: `user`, `login(email, password)`, `logout()`, `isLoading`
- On mount: calls `getSessionUser()` to restore session

Auth guard in `(app)/layout.tsx`:
- On mount check `getSessionUser()`, if null → `router.push("/")`
```
/*
 * ── JAVA BACKEND AUTH GUARD (uncomment when ready) ───────────────────────────
 * Replace sessionStorage check with JWT validation:
 *
 * GET /api/auth/me  →  Headers: Authorization: Bearer <token>
 *                   →  Returns: { user } or 401
 *
 * middleware.ts:
 * export async function middleware(req: NextRequest) {
 *   const token = req.cookies.get("rb_jwt_token")?.value;
 *   if (!token) return NextResponse.redirect(new URL("/", req.url));
 * }
 * export const config = { matcher: ["/((?!$|_next|api/auth/login).*)"] };
 * ─────────────────────────────────────────────────────────────────────────────
 */
```

---

## Storage — Demo Mode

Create `lib/storage.ts` — all reads/writes go to sessionStorage under `rb_state`:
```ts
export function getState(): AppState { ... }
export function saveState(patch: Partial<AppState>): void { ... }
```
```
/*
 * ── JAVA BACKEND STORAGE (uncomment when ready) ───────────────────────────────
 * Replace sessionStorage calls with JDBC/JDBI API calls:
 *
 * Profile:   GET/PUT  /api/profile
 * Certs:     GET/POST/DELETE /api/certificates/:id
 * Seminars:  GET/POST/PATCH/DELETE /api/seminars/:id
 * Files:     GET/POST /api/files/upload, DELETE/GET /api/files/:id/download
 * History:   GET/POST/DELETE /api/resume/history/:id
 *
 * All requests: headers: { Authorization: `Bearer ${token}` }
 * ─────────────────────────────────────────────────────────────────────────────
 */
```

---

## Shared Layout (all authenticated pages)

**AppHeader:**
- Left: logo mark + "Resume Builder" + "auto update and generation"
- Right: user email (muted) + "Logout" `<Button variant="outline">` →
  `<AlertDialog>` confirmation → `demoLogout()` → `router.push("/")`

**AppSidebar:**
- Mobile: shadcn `<Sheet side="left">` triggered by `<Menu>` icon
- Desktop (md+): persistent fixed left sidebar, 220px wide
- Nav items (in order):
  - ⊞ Dashboard      → /dashboard
  - 👤 Profile        → /profile
  - 📄 Resume Builder → /resume-builder
  - 🏅 Certificates   → /certificates
  - 🎓 Seminars       → /seminars
  - 🗂 File Manager   → /file-manager
- Active item: highlighted background + accent left border
- Bottom: Logout button (same AlertDialog)

---

## Empty State Component

Create `components/ui/empty-state.tsx`:
```tsx
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  heading,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{heading}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
```

Use `<EmptyState>` in:

| Page | Icon | Heading | Description |
|---|---|---|---|
| Certificates | `Award` | "No certificates yet" | "Upload a certificate above to get started." |
| Seminars / Completed | `GraduationCap` | "No completed seminars yet" | "Seminars you complete will appear here and sync to your resume." |
| Seminars / On Queue | `CalendarClock` | "No upcoming seminars" | "Add seminars you plan to attend using the button above." |
| File Manager | `FolderOpen` | "No files uploaded" | "Upload documents, certificates, or transcripts to keep them in one place." |
| Resume History | `Clock` | "No saved versions yet" | "Click 'Save Version' above to snapshot your current resume." |
| Publications | `BookOpen` | "No publications synced" | "Enter your ORCID ID and click Sync, or add publications manually." |

---

## Date Pickers — shadcn Calendar + Popover

Use this pattern for ALL date inputs. No plain `<input type="date">` anywhere.

**Single date picker** (Seminars):
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start text-left font-normal">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
  </PopoverContent>
</Popover>
```

**Date range picker** (Experience / Education from–to):
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start text-left font-normal">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {range?.from
        ? range.to
          ? `${format(range.from, "MMM yyyy")} → ${format(range.to, "MMM yyyy")}`
          : format(range.from, "MMM yyyy")
        : "Pick date range"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      numberOfMonths={2}
      initialFocus
    />
  </PopoverContent>
</Popover>
```

Install: `pnpm add date-fns`

Apply in:
- Profile → Experience tab: date range picker (start → end)
- Profile → Education tab: date range picker (from → to)
- Resume Builder → Work Experience accordion: date range picker
- Resume Builder → Education accordion: date range picker
- Seminars → Add Seminar dialog: single date picker

---

## Page 1: Landing / Auth (/)

Layout:
- Desktop: left half hero, right half auth `<Card>`
- Mobile: stacked, compact hero above card

Hero (left):
- Headline: "Automatically Build and Update Your Academic Resume"
- Subtitle
- 3-step visual: Fill Profile → Build Resume → Export PDF

Auth Card (right) — LOGIN ONLY (demo mode):
- Heading "Welcome back"
- `<Alert>` (amber) with demo credentials + "Auto-fill" button that populates fields
- Email `<Input>` + Password `<Input>`
- "Login" `<Button>` full width, loading spinner state
- Error: `<Alert variant="destructive">`
- On success → `router.push("/dashboard")`
- On mount: if `getSessionUser()` exists → `router.push("/dashboard")`
```
/*
 * ── RE-ENABLE FOR PRODUCTION ──────────────────────────────────────────────────
 * - Add Sign Up <Tabs> tab with full registration form
 * - Add Google OAuth <Button>
 * - Add Forgot Password link → /forgot-password
 * - Replace demoLogin() with backendLogin() from lib/auth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */
```

---

## Page 2: Dashboard (/dashboard)

- Greeting `<Card>`: time-of-day + firstName + "View & edit profile →"
  `<Button variant="link">`. firstName from `getSessionUser().name` or
  `getState().profile.name`.
- "How it works" `<Card>`: 5-step horizontal stepper with badge numbers + arrows.
  Steps: Fill Profile → Build Resume → Add Certificates → Log Seminars → Export PDF.
  Responsive — wraps on mobile.
- Section guide: responsive grid (2 col md, 1 col mobile) of `<Card>` components,
  each a Next.js `<Link>`. Sections: Profile, Resume Builder, Certificates,
  Seminars, File Manager. Each card: icon + name in `<CardHeader>`, description
  in `<CardDescription>`, bullet steps in `<CardContent>`.
  Hover: border highlight + subtle shadow lift via Tailwind.
- Navigation tips `<Card>`: 4 rows each with colored `<Badge>` prefix
  (☰ 💾 ⚡ 🔄) + tip text.

---

## Page 3: Profile (/profile)

Organize with shadcn `<Tabs>` (horizontal, scrollable on mobile):

| Tab | Fields |
|---|---|
| Personal Info | name, phone, email, location, LinkedIn, website, designation, department, institution, Vidwan ID, ORCID ID |
| Bio & Skills | professional summary `<Textarea>`, technical skills (tag chips), tools (tag chips), soft skills (tag chips) |
| Education | dynamic list → add/edit via `<Dialog>`, range date picker, institution/degree/field/CGPA |
| Experience | dynamic list → `<Dialog>`, range date picker, role/company/description |
| Projects | dynamic list → `<Dialog>`, title/description/tech stack (tags)/link |
| Publications | ORCID sync button + `<Skeleton>` loading + publication cards + manual add `<Dialog>` |
| More | Awards (add/remove), Languages (tag chips), read-only Certificates count, read-only Seminars count |

- Tag chip inputs: type → Enter to add, × to remove
- Dynamic lists: `<Card>` per item with edit/delete, + add opens `<Dialog>`
- Sticky save bar: "Save Profile" `<Button>` + orange unsaved indicator dot when dirty
- Saves to `rb_state.profile` via `saveState()`

---

## Page 4: Resume Builder (/resume-builder)

Layout:
- Desktop: left 40% editor, right 60% A4 preview (both independently scrollable)
- Mobile: `<Tabs>` → "Edit" | "Preview"

**Left Panel (Editor):**

Top action bar:
- "⚡ Generate from Profile" `<Button>` — populates all fields from `rb_state.profile`
- "Export PDF" `<Button variant="outline">` — html2pdf or react-to-print
- "Save Version" `<Button variant="secondary">` — saves snapshot to resume history

Accordion sections (`<Accordion type="multiple">`):
Personal Info, Summary, Education, Skills, Projects, Work Experience,
Certifications, Seminars, Publications, Awards, Languages

- All date fields → shadcn Calendar + Popover (range or single as appropriate)
- Dynamic lists → add/remove mini cards within accordion items
- Certifications: auto-populated from `rb_state.savedCertificates`
- Seminars: auto-populated from `rb_state.seminars.completed`

**Right Panel (A4 Preview):**
- White A4-ratio card (box-shadow, 1:1.414 ratio)
- Crimson Text font for resume body
- Live updates as editor fields change
- Certificates + completed seminars auto-appear

---

## Resume History Manager

Create `lib/resumeHistory.ts`:
```ts
export type ResumeSnapshot = {
  id: string;
  label: string;       // "Version 3" or "Saved Apr 12, 2:30 PM"
  savedAt: string;     // ISO timestamp
  resumeData: ResumeData;
};

const HISTORY_KEY = "rb_resume_history";
const MAX_SNAPSHOTS = 4;

export function getHistory(): ResumeSnapshot[] {
  // reads from sessionStorage HISTORY_KEY
}
export function saveSnapshot(data: ResumeData): ResumeSnapshot {
  // prepend new snapshot, trim to MAX_SNAPSHOTS, write to sessionStorage
}
export function deleteSnapshot(id: string): void {
  // filter by id and save
}
export function restoreSnapshot(id: string): ResumeData | null {
  // find snapshot by id and return its resumeData
}
```
```
/*
 * ── JAVA BACKEND HISTORY (uncomment when ready) ───────────────────────────────
 * GET    /api/resume/history        → array of up to 4 snapshots (desc by date)
 * POST   /api/resume/history        → body: { resumeData }, saves new snapshot
 * DELETE /api/resume/history/:id    → deletes snapshot
 *
 * DB table (JDBI):
 *   resume_history(id, user_id, label, saved_at, resume_data JSONB)
 * ─────────────────────────────────────────────────────────────────────────────
 */
```

Create `components/resume/ResumeHistoryPanel.tsx`:
- Section heading "Resume History" + `<Badge>` showing count e.g. "2 / 4"
- Empty state → `<EmptyState icon={Clock} ...>`
- History list (newest first): up to 4 snapshot cards each showing:
  - Label + timestamp "Apr 12, 2025 · 2:30 PM"
  - "Restore" `<Button size="sm" variant="outline">` →
    `<AlertDialog>` "Restore this version? Current changes will be replaced."
  - `<Trash2>` `<Button size="icon" variant="ghost" className="text-destructive">`
  - Active/restored snapshot: ring border highlight
- Sonner toasts: "Version saved ✓" on save, "Version restored" on restore
- Placed below the accordion editor as a collapsible section

---

## Page 5: Certificates (/certificates)

- Upload zone: dashed border card, upload icon, label, hint. Click → file input.
  Drag-over → border highlights. Preserve `handleCertUpload` logic exactly.
- After upload: extracted data `<Card>` slides in:
  - Certificate Title (full width), Recipient Name (full width)
  - 2-col row: Issuing Organization + Year
  - Footer: "Confirm & Save" `<Button>` + "Discard" `<Button variant="ghost">`
- Saved list: horizontal `<Card>` per cert, title + org · year + `<Trash2>` delete
- Empty state: `<EmptyState icon={Award} ...>`
- State: `rb_state.savedCertificates`
- Toasts: Sonner

---

## Page 6: Seminars (/seminars)

`<Tabs defaultValue="completed">`: Completed | On Queue

**On Queue tab:**
- "+ Add Seminar" `<Button>` → `<Dialog>`:
  - Title `<Input>`
  - Organizer `<Input>`
  - Date: shadcn `<Calendar mode="single">` in `<Popover>`
    Hint below picker: "Selecting a past date will auto-move to Completed"
  - Notes `<Textarea>`
  - Footer: "Save" `<Button>` + "Cancel" `<Button variant="ghost">`
- Preserve `saveSeminar()` logic exactly (past date → completed, future → queue)
- Queue list: `<Card>` per seminar, title + org · date + notes,
  "✓ Mark Complete" `<Button size="sm">` + `<Trash2>` delete icon button
- Empty state: `<EmptyState icon={CalendarClock} ...>`

**Completed tab:**
- `<Card>` per seminar, title + org · formatted date + notes,
  "✓ In Resume" `<Badge variant="secondary">` + delete icon button
- Empty state: `<EmptyState icon={GraduationCap} ...>`

Preserve `checkSeminarDates()` auto-move on mount.
State: `rb_state.seminars` (`{ completed: [], queue: [] }`)

---

## Page 7: File Manager (/file-manager)

Demo mode — metadata only, no actual file bytes stored.

Create `lib/demoFiles.ts`:
```ts
// Stores file metadata in sessionStorage "rb_files"
export type DemoFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
};
export function getFiles(): DemoFile[] { ... }
export function addFile(file: File): DemoFile { ... }  // metadata only, no bytes
export function deleteFile(id: string): void { ... }
export function formatSize(bytes: number): string { ... }
```

UI:
- Toolbar: "⬆ Upload File" `<Button>` → hidden file input → `addFile()`
- Upload: fake 800ms progress with `<Progress>` bar
- File list: shadcn `<Table>`:

  | File Name | Type | Date · Size | Actions |
  |---|---|---|---|
  | 📎 filename | `<Badge variant="outline">` ext | muted date · size | Download + Delete |

- Download button: Sonner toast "Download not available in demo mode"
- Loading: 3× `<Skeleton>` rows on mount
- Delete: `<AlertDialog>` confirm before `deleteFile()`
- Empty state: `<EmptyState icon={FolderOpen} ...>`
- Mobile: table collapses to stacked cards on `sm` breakpoint
```
/*
 * ── JAVA BACKEND FILE OPS (uncomment when ready) ──────────────────────────────
 * GET    /api/files               → list file metadata (JDBI)
 * POST   /api/files/upload        → multipart upload → disk/S3 + JDBI record
 * DELETE /api/files/:id           → removes file + DB record
 * GET    /api/files/:id/download  → streams file bytes
 *
 * Replace demoFiles.ts functions with fetch() calls + getAuthHeaders()
 *
 * DB table (JDBI):
 *   files(id, user_id, original_name, file_size, mime_type, stored_path, created_at)
 * ─────────────────────────────────────────────────────────────────────────────
 */
```

---

## Global UX Rules

- All `confirm()` → `<AlertDialog>`
- All custom toasts → Sonner (`toast.success`, `toast.error`, `toast.info`)
- Logout confirmation → `<AlertDialog>`
- Loading states → `<Skeleton>` for data, spinner inside `<Button>` for actions
- Forms → `react-hook-form` + `zod`, inline `<FormMessage>` errors
- Mobile: sidebar = `<Sheet>`, tables → stacked cards on `sm`
- Accessibility: `aria-label` on all icon-only buttons, `<Label>` for all inputs
- Transitions: Tailwind `transition-all` for sidebar, Radix animations for dialogs

---

## Constraints

| Rule | Detail |
|---|---|
| ✗ No Firebase | Demo auth only via `lib/auth.ts` |
| ✗ No real HTTP calls | All data stays in sessionStorage |
| ✗ No schema changes | Keep `rb_state` keys identical to original |
| ✗ No feature removal | Every feature from the HTML files must exist |
| ✗ No plain date inputs | shadcn Calendar + Popover everywhere |
| ✗ No npm/npx | Use pnpm exclusively |
| ✗ No shadcn reinit | Preset already applied, just add components |
| ✓ Comment all integration points | Use the Java backend comment block format shown above |
| ✓ Resume history is new | Implement fully in sessionStorage demo mode |
| ✓ EmptyState everywhere | Use the component for all empty lists |
| ✓ Improve UX freely | Dialogs over inline forms, better loading, better errors |
