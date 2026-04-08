# Implementation Plan: Laundry Biz App

## Phase 1: Project Setup and Tooling

**Goal: Working development environment with hot reload**

**Important:** Database will use OPFS (browser storage), not repository files. Data persists across refreshes but is not in the repo.

1. Initialize Vite project with React 19 template
2. Configure Tailwind CSS v4 with custom theme variables
3. Install sql.js for SQLite WASM support
4. Configure Vite PWA plugin for offline capabilities
5. Set up project folder structure (src/, public/, docs/)
6. Create manifest.json for PWA installation
7. Create icon.svg
8. Set up src/index.css with Linear-style design tokens
9. Test dev server runs and shows blank app shell

**Deliverable:** `npm run dev` opens working blank app

## Phase 2: Database Layer

**Goal: SQLite persistence via OPFS working**

**Note:** Database lives in browser OPFS storage, not in repository files. It will persist across refreshes but won't appear in `git status`.

1. Create db.js module with initialization logic
2. Implement initDB() function:
   - Load sql.js WASM from CDN
   - Check OPFS for existing database file
   - Create fresh database if none exists
3. Define database schema:
   - orders table (id, customer_name, phone, items_json, total, status, timestamps)
   - items_lookup table (name, unit_price) for preset pricing
4. Seed items_lookup with default items (Shirt, Pants, Dress, Jacket, Suit, Coat)
5. Implement persistDB() function to write to OPFS
6. Set up auto-save interval (3 seconds)
7. Add pagehide event listener for emergency save
8. Implement exportDB() function for manual backups
9. Implement importDB() function for restores
10. Create simple test page to verify create/read/update/delete works

**Deliverable:** Database survives page refresh, export/import works

## Phase 3: UI Foundation

**Goal: Linear-style layout and navigation**

1. Create App.jsx with sidebar + main content layout
2. Implement sidebar navigation:
   - Orders Board (default)
   - New Order
   - Search
   - Backup/Restore
3. Apply design tokens:
   - Dark background (#0f1115)
   - Subtle borders (#272a30)
   - Indigo accent (#5e6ad2)
   - Inter font family
4. Create view state management (useState for current view)
5. Add smooth transitions between views

**Deliverable:** Can navigate between 4 views, looks like Linear

## Phase 4: New Order Form

**Goal: Create orders with items and pricing**

1. Build form layout:
   - Customer name input (required)
   - Phone input (optional)
   - Dynamic item rows
2. Create item row component:
   - Dropdown for item selection (populated from items_lookup)
   - Quantity input (number, min 1)
   - Remove button
   - Auto-populate price from lookup
3. Add "Add Item" button for additional rows
4. Implement real-time total calculation
5. Create Order button:
   - Validate customer name exists
   - Validate at least one item has name
   - Insert into database
   - Reset form
   - Redirect to board view
6. Show success feedback

**Deliverable:** Can create complete orders, see them in database

## Phase 5: Kanban Board

**Goal: Visual workflow management**

1. Define status columns: dropoff, washing, ready, picked
2. Create column layout (4-column grid)
3. Query database for non-picked orders
4. Render order cards in appropriate columns:
   - Show order number, customer name
   - Show total price (formatted as euros)
   - Show phone number
   - Show item summary (qty x name)
5. Add status indicators (colored dots matching column)
6. Implement status transition:
   - Show dots for adjacent statuses
   - Click to move order
   - Update database
   - Refresh board
7. Add order count per column in header
8. Sort orders by updated_at (most recent first)

**Deliverable:** Can see orders in columns, move them through workflow

## Phase 6: Search Functionality

**Goal: Find orders quickly**

1. Create search input field
2. Add search button
3. Implement search query:
   - Partial match on customer_name
   - Partial match on phone
   - Exact match on order id
4. Display results as list (not kanban):
   - Show all details
   - Show status badge
   - Show creation date
5. Handle empty state (no results)
6. Add keyboard support (Enter to search)
7. Include picked-up orders in results

**Deliverable:** Can find orders by name, phone, or number

## Phase 7: Backup and Restore

**Goal: Data safety and portability**

1. Create backup section:
   - Description text
   - Export button
   - Generate filename with date (laundry-backup-YYYY-MM-DD.db)
   - Trigger file download
2. Create restore section:
   - Warning about data replacement
   - File input (.db files only)
   - Import button
   - Replace current database
   - Show success/error feedback
3. Add storage info section explaining OPFS

**Deliverable:** Can export and import database files

## Phase 8: PWA and Offline

**Goal: Installable app that works without network**

1. Configure service worker (via Vite PWA plugin)
2. Cache static assets (JS, CSS, HTML, WASM)
3. Test offline mode:
   - Disconnect network
   - Reload app
   - Verify all features work
4. Add PWA install prompt handling
5. Test installation on desktop Chrome
6. Verify icon and manifest work correctly

**Deliverable:** App installs, works offline, has desktop icon

## Phase 9: Testing and Polish

**Goal: Stable, usable MVP**

1. Test full workflow:
   - Create 10+ orders
   - Move through all statuses
   - Search for old orders
   - Export database
   - Clear browser data
   - Import database
   - Verify all data restored
2. Test edge cases:
   - Empty customer name (should fail gracefully)
   - Orders with many items (20+)
   - Long customer names
   - Special characters in phone
3. Performance check:
   - 100 orders should load instantly
   - Search should be fast
4. Add keyboard shortcuts (optional):
   - Ctrl+N for new order
5. Final UI polish:
   - Empty states for each view
   - Loading states
   - Error messages

**Deliverable:** Production-ready build

**Note on testing:** To reset data to a clean state, use Chrome DevTools → Application → Storage → Clear site data. This wipes OPFS. The database file is not in the repo so `git clean` won't affect it.

## Build and Deploy

1. Run `npm run build`
2. Verify dist/ folder contains all assets
3. Test production build locally
4. Document deployment options:
   - Static file server (nginx, Caddy)
   - GitHub Pages
   - Netlify
   - Vercel

## File Structure

```
laundry-biz-app/
├── docs/
│   ├── PRD.md
│   └── IMPLEMENTATION.md
├── public/
│   ├── manifest.json
│   └── icon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── db.js
│   ├── index.css
│   └── components/
│       ├── Sidebar.jsx
│       ├── OrderCard.jsx
│       ├── ItemRow.jsx
│       └── StatusBadge.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Dependencies

**Production:**
- react: ^19.0.0
- react-dom: ^19.0.0
- sql.js: ^1.12.0

**Development:**
- @vitejs/plugin-react: ^4.2.1
- tailwindcss: ^4.0.0
- vite: ^6.0.0
- vite-plugin-pwa: ^0.21.0

## Estimated Timeline

- Phase 1 (Setup): 2 hours
- Phase 2 (Database): 4 hours
- Phase 3 (UI Foundation): 3 hours
- Phase 4 (New Order): 4 hours
- Phase 5 (Kanban): 4 hours
- Phase 6 (Search): 2 hours
- Phase 7 (Backup): 2 hours
- Phase 8 (PWA): 2 hours
- Phase 9 (Testing): 3 hours

**Total: 26 hours** (approximately 3-4 days of focused work)
