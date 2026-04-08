# Task List: Laundry Biz App

## Phase 1: Project Setup and Tooling

**Run manually:**

```bash
cd /home/mchael-vps/gh-repo/laundry-biz-app
npm create vite@latest . -- --template react-swc
npm install react@^19.0.0 react-dom@^19.0.0
npm install -D tailwindcss@^4.0.0
npm install sql.js vite-plugin-pwa
```

- [ ] Initialize Vite project with React 19 template (run command above)
- [ ] Install dependencies (run command above)
- [ ] Configure Vite PWA plugin in vite.config.js
- [ ] Create public/ folder with manifest.json
- [ ] Create public/icon.svg
- [ ] Set up src/ folder structure
- [ ] Create src/index.css with Linear-style design tokens
- [ ] Test dev server runs at localhost:5173
- [ ] Verify blank app shell renders correctly

## Phase 2: Database Layer

**Data storage:** Uses OPFS (browser storage). Data persists across refreshes but is NOT stored in the git repository. To reset data, clear site data in DevTools.

- [ ] Create src/db.js module
- [ ] Implement initDB() to load sql.js WASM
- [ ] Add OPFS detection and file loading logic
- [ ] Create orders table schema
- [ ] Create items_lookup table schema
- [ ] Seed default items (Shirt, Pants, Dress, Jacket, Suit, Coat)
- [ ] Implement persistDB() to write to OPFS
- [ ] Set up 3-second auto-save interval
- [ ] Add pagehide event listener for emergency save
- [ ] Implement exportDB() function
- [ ] Implement importDB() function
- [ ] Create simple database test in console
- [ ] Verify data survives page refresh

## Phase 3: UI Foundation

- [ ] Create App.jsx with sidebar layout
- [ ] Implement useState for view switching
- [ ] Create Sidebar component with 4 navigation items
- [ ] Apply Tailwind design tokens (surface, border, accent colors)
- [ ] Set up Inter font family
- [ ] Create placeholder views for each route
- [ ] Add active state styling for navigation
- [ ] Test smooth view transitions

## Phase 4: New Order Form

- [ ] Create form layout with customer inputs
- [ ] Build ItemRow component with dropdown and quantity
- [ ] Populate dropdown from items_lookup database
- [ ] Auto-populate price when item selected
- [ ] Add addItemRow() functionality
- [ ] Add removeItemRow() functionality
- [ ] Implement real-time total calculation
- [ ] Add validation (customer name required)
- [ ] Connect form to database insert
- [ ] Reset form after successful creation
- [ ] Redirect to board view after submit
- [ ] Test creating multiple orders

## Phase 5: Kanban Board

- [ ] Define status columns array
- [ ] Create 4-column grid layout
- [ ] Query active orders from database
- [ ] Create OrderCard component
- [ ] Render cards in correct columns by status
- [ ] Add colored status dots to column headers
- [ ] Implement moveStatus() function
- [ ] Add clickable status dots for transitions
- [ ] Show order count in column headers
- [ ] Sort orders by updated_at
- [ ] Test moving orders through full workflow

## Phase 6: Search Functionality

- [ ] Create search input field
- [ ] Add search button
- [ ] Implement SQL query for partial name match
- [ ] Implement SQL query for partial phone match
- [ ] Implement SQL query for exact order id match
- [ ] Create search results list view
- [ ] Show all order details in results
- [ ] Add status badge to results
- [ ] Format creation date
- [ ] Handle empty state (no results found)
- [ ] Add Enter key support for search
- [ ] Test search with various queries

## Phase 7: Backup and Restore

- [ ] Create backup section layout
- [ ] Implement export button with filename generation
- [ ] Trigger file download on export
- [ ] Create restore section layout
- [ ] Add warning text about data replacement
- [ ] Add file input for .db files
- [ ] Implement import logic with database replacement
- [ ] Show success feedback after import
- [ ] Show error feedback on failed import
- [ ] Add storage info explanation section
- [ ] Test export and import roundtrip

## Phase 8: PWA and Offline

- [ ] Verify service worker configuration
- [ ] Confirm static assets are cached
- [ ] Test offline mode (disconnect network)
- [ ] Verify app loads from cache
- [ ] Test all features work offline
- [ ] Add PWA install prompt handling
- [ ] Install app on desktop
- [ ] Verify icon appears on desktop/taskbar
- [ ] Test launching as installed app
- [ ] Verify manifest works correctly

## Phase 9: Testing and Polish

- [ ] Create 10+ test orders
- [ ] Move all orders through full workflow
- [ ] Search for orders by name, phone, id
- [ ] Export database to file
- [ ] Clear browser storage
- [ ] Import database file
- [ ] Verify all data restored correctly
- [ ] Test empty customer name validation
- [ ] Test order with 20+ items
- [ ] Test long customer names display
- [ ] Test special characters in phone field
- [ ] Performance test with 100 orders
- [ ] Add empty state messages for each view
- [ ] Add loading states where needed
- [ ] Add error message displays
- [ ] Final UI polish pass

## Build and Deployment

- [ ] Run production build
- [ ] Verify dist/ folder contents
- [ ] Test production build locally
- [ ] Document deployment instructions

## Documentation

- [ ] Write README.md with setup instructions
- [ ] Document browser requirements
- [ ] Document backup/restore procedures
- [ ] Document keyboard shortcuts

## Progress Tracker

**Phase 1:** **_/10 tasks  
**Phase 2:** _**/13 tasks  
**Phase 3:** **_/9 tasks  
**Phase 4:** _**/12 tasks  
**Phase 5:** **_/11 tasks  
**Phase 6:** _**/12 tasks  
**Phase 7:** **_/11 tasks  
**Phase 8:** _**/11 tasks  
**Phase 9:** **_/17 tasks  
**Build:** _**/4 tasks  
**Docs:** \_\_\_/4 tasks

**Total Complete:** \_\_\_/114 tasks
