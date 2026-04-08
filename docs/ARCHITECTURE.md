# Architecture: Laundry Biz App

## Overview

Laundry Biz App is an offline-first Progressive Web Application that uses SQLite via WebAssembly with Origin Private File System persistence. This architecture enables a full SQL database to run entirely in the browser without cloud dependencies.

**Important for PoC:** Data persists across browser refreshes but lives in the browser's Origin Private File System sandbox. The database file is not stored in the git repository. To backup or migrate data, use the export/import feature.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Chrome/Edge)                │
│  ┌─────────────────────────────────────────────────┐   │
│  │           React 19 Application                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │   │
│  │  │  Views  │  │  State  │  │  Event Handlers │  │   │
│  │  └─────────┘  └─────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                      │                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Database Layer (db.js)                 │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │   │
│  │  │ SQLite  │  │  OPFS   │  │  Import/Export  │  │   │
│  │  │  WASM   │  │  File   │  │     Handlers    │  │   │
│  │  └─────────┘  └─────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                      │                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │        Origin Private File System               │   │
│  │              (laundry.db file)                  │   │
│  └─────────────────────────────────────────────────┘   │
│                      │                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │        Service Worker (Vite PWA Plugin)         │   │
│  │    (Caches app shell and WASM for offline)      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Application Startup

1. Browser loads index.html from cache or network
2. Service worker activates if not already running
3. React mounts to root DOM node
4. initDB() called on app mount
5. sql.js WASM loaded from CDN or cache
6. OPFS checked for existing laundry.db file
7. If file exists: load binary into SQLite
8. If no file: create fresh SQLite database
9. Database schema created (if new)
10. Default items seeded into items_lookup
11. App renders with database ready

### Order Creation

1. User fills new order form
2. React state updates for each field
3. Create Order button clicked
4. Validation checks run
5. db.js insert function called
6. SQL INSERT executed in memory
7. Data immediately available for queries
8. persistDB() scheduled (or runs on interval)
9. SQLite binary exported
10. Binary written to OPFS laundry.db file
11. User redirected to board view
12. Board queries refreshed, new order appears

### Status Update (Kanban)

1. User clicks status dot on order card
2. moveStatus() called with order ID and new status
3. SQL UPDATE executed in memory
4. persistDB() updates OPFS file
5. Board state refreshed from database
6. Card animates to new column

### Export/Import

**Export:**

1. User clicks Export button
2. exportDB() called
3. SQLite db.export() creates Uint8Array
4. Blob created with application/octet-stream type
5. Object URL generated
6. Hidden anchor element triggered
7. File downloads as laundry-backup-YYYY-MM-DD.db

**Import:**

1. User selects .db file via file input
2. File read as ArrayBuffer
3. importDB() creates new SQLite instance
4. Binary loaded into sql.js
5. persistDB() writes to OPFS (replaces old file)
6. App state refreshed
7. Success message displayed

## Component Structure

```
App.jsx (root)
├── Sidebar (navigation)
│   └── NavButton (4 items)
│
├── Views (conditional render)
│   ├── BoardView (kanban)
│   │   └── StatusColumn (4 columns)
│   │       └── OrderCard (multiple)
│   │           └── StatusDots
│   │
│   ├── NewOrderView (form)
│   │   ├── CustomerInputs
│   │   └── ItemRows (dynamic)
│   │       └── ItemRow
│   │           ├── ItemSelect
│   │           ├── QuantityInput
│   │           └── RemoveButton
│   │
│   ├── SearchView
│   │   ├── SearchInput
│   │   ├── SearchButton
│   │   └── ResultsList
│   │       └── OrderRow
│   │
│   └── BackupView
│       ├── ExportSection
│       ├── ImportSection
│       └── InfoSection
```

## Database Schema

### orders Table

- id: INTEGER PRIMARY KEY AUTOINCREMENT
- customer_name: TEXT NOT NULL
- phone: TEXT (optional)
- items_json: TEXT NOT NULL (JSON array of items)
- total: INTEGER NOT NULL (cents, to avoid floating point)
- status: TEXT DEFAULT 'dropoff' (dropoff/washing/ready/picked)
- created_at: INTEGER (unix epoch)
- updated_at: INTEGER (unix epoch)

### items_lookup Table

- name: TEXT PRIMARY KEY
- unit_price: INTEGER NOT NULL (cents)

**Default items:**

- Shirt: €0.25
- Pants: €0.35
- Dress: €0.50
- Jacket: €0.60
- Suit: €1.20
- Coat: €0.80

## Storage Architecture

### Why OPFS over IndexedDB

**Traditional approach (IndexedDB + sql.js):**

- SQLite runs in memory only
- Full database exported/imported to IndexedDB
- Manual sync on interval or events
- Risk of data loss if crash between syncs
- IndexedDB acts as opaque blob storage

**OPFS approach:**

- SQLite mounts actual file on disk
- Writes go directly to persistent storage
- No manual sync logic needed
- Atomic file operations
- Native file system semantics

### Persistence Strategy

**Auto-save:**

- Runs every 3 seconds during active use
- Lightweight: SQLite export is fast for small databases
- Prevents significant data loss on crash

**Event-based save:**

- pagehide event triggers immediate save
- Captures data when user closes tab/browser

**Explicit save:**

- Order creation triggers save
- Status updates trigger save

### File Location

**The database file does NOT live in your repository.**

From browser perspective: opaque OPFS sandbox
Actual location on disk (Chrome):

- Linux: `~/.config/google-chrome/Default/File System/`
- macOS: `~/Library/Application Support/Google/Chrome/`
- Windows: `%LOCALAPPDATA%\Google\Chrome\User Data\`

User never interacts with this path directly. The file is:

- Invisible to `ls` in your repo
- Not tracked by git
- Not editable with standard text editors
- Only accessible via browser APIs or DevTools

To make data portable, use the Export feature to download the .db file.

## Offline Strategy

### Caching

**Service Worker (Vite PWA):**

- App shell (HTML, CSS, JS) cached on first load
- sql.js WASM cached
- Subsequent loads serve from cache instantly
- Updates download in background, activate on next load

**Behavior:**

- First visit: download all assets, cache them
- Return visit: load from cache (instant)
- Offline: everything works from cache
- Network available: check for updates in background

### Database Without Network

- OPFS is browser API, requires no network
- SQLite WASM is cached, loads locally
- All operations work offline
- No sync conflicts (single user, single device)

## State Management

**No Redux/Zustand needed.**

**State handled by:**

1. React useState for UI state (current view, form inputs)
2. SQLite database for application state (orders, items)
3. Local component state for ephemeral UI

**Data flow:**

- User action → Event handler → Database operation → Re-query → Re-render
- Single source of truth: SQLite
- React re-renders when data changes

## Security Considerations

### Data Isolation

- Each browser profile has separate OPFS sandbox
- Data not shared between Chrome profiles
- Data not accessible from other origins

### No Encryption

- Database file stored unencrypted on disk
- Physical access to computer = access to data
- Backup files (.db) are unencrypted
- This matches the threat model (local shop, physical security)

### Future: Encryption

Could add SQLCipher WASM for encrypted database if needed.

## Performance Characteristics

### Database Size

- Orders: ~200 bytes per order
- 1,000 orders: ~200 KB
- 10,000 orders: ~2 MB
- OPFS handles multi-GB files

### Query Speed

- Order lookup by ID: < 1ms
- Search by name (LIKE): < 10ms for 10K orders
- Full kanban refresh: < 50ms for 100 active orders

### Memory Usage

- sql.js WASM: ~2 MB
- SQLite database: loaded into memory
- React app: negligible
- Total: < 50 MB for typical usage

### Persistence Overhead

- Export binary: ~2ms for 1K orders
- Write to OPFS: ~5ms
- Auto-save every 3s: imperceptible

## Scalability Limits

### Current Architecture

- Single device only
- Single user at a time
- No multi-device sync
- No cloud backup

### When to Evolve

- Multiple employees need simultaneous access → Add local network sync
- Owner wants cloud backup → Add optional cloud export
- Multiple locations → Add proper backend with sync

## Technology Choices

### React 19

- Latest stable version
- Concurrent features for responsive UI
- Server Components not needed (no server)

### Tailwind v4

- Native CSS imports (no config file)
- Design tokens in CSS
- Smaller bundle than v3

### sql.js

- Mature SQLite WASM binding
- Synchronous API (simpler than async)
- Well documented

### OPFS

- Direct file access
- No sync logic needed
- Chrome/Edge stable

### Vite

- Fast dev server
- PWA plugin handles service worker
- Optimized builds

## Debugging

### Database Inspection

Chrome DevTools → Application → Storage:

- OPFS shows laundry.db file
- Can download file for external inspection

### SQLite Console

Open browser console:

```js
const db = getDB();
db.exec('SELECT * FROM orders');
```

### Export Debugging

Check exported .db file with:

- DB Browser for SQLite (GUI)
- sqlite3 CLI

## Future Architecture Possibilities

### Multi-Device Sync (Local Network)

1. Run tiny sync server on shop WiFi router
2. Use WebRTC or WebSocket for peer discovery
3. CRDT or last-write-wins for conflict resolution
4. SQLite replication via WAL mode

### Cloud Backup (Optional)

1. Add optional cloud export on interval
2. Upload to S3-compatible storage
3. Encrypt before upload
4. Restore from cloud on new device setup

### Mobile Responsive

1. Redesign sidebar as bottom nav
2. Stack kanban columns vertically
3. Touch-optimized card sizes
4. Swipe gestures for status changes
