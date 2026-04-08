# Product Requirements Document: Laundry Biz App

## 1. Overview

Laundry Biz App is an offline-first Progressive Web Application designed for laundry business owners and employees to manage daily operations without relying on internet connectivity or cloud services. The app runs entirely in the browser using local SQLite storage via Origin Private File System (OPFS).

## 2. Goals

- Provide a reliable order tracking system that works during internet outages
- Replace paper-based order management with a digital kanban workflow
- Enable quick order creation with standardized pricing
- Allow owners to backup and restore business data locally
- Serve as a proof-of-concept for offline-first business tools

## 3. Target Users

**Primary: Laundry Business Owners**

- Small to medium laundry shops
- Want digital records without subscription fees
- Need offline reliability

**Secondary: Laundry Employees**

- Front counter staff taking orders
- Back-of-house staff updating order status

**Environment: Single shared desktop computer at the shop**

## 4. Core Features

### 4.1 Order Management

- Create new orders with customer name and phone
- Add multiple items per order with quantity
- Auto-calculate totals based on preset item prices
- Assign unique order numbers automatically

### 4.2 Kanban Workflow

- Four status columns: Drop-off, Washing, Ready, Picked Up
- Visual cards showing order number, customer name, total, items
- One-click status transitions (move forward or backward)
- Status indicators with color coding

### 4.3 Search

- Search by order number
- Search by customer name (partial match)
- Search by phone number (partial match)
- Show all historical orders including picked up

### 4.4 Data Persistence

- Automatic save to Origin Private File System every 3 seconds
- Data survives browser restarts and computer reboots
- No cloud dependency

### 4.5 Backup and Restore

- Export SQLite database as .db file
- Import .db file to restore previous state
- Manual backup option for migration/disaster recovery

## 5. Technical Requirements

### 5.1 Stack

- React 19
- Tailwind CSS v4 (native CSS imports, no config file)
- SQLite WASM (sql.js)
- Vite with PWA plugin
- Origin Private File System API

### 5.2 Browser Requirements
- Chrome 109+ or Edge 109+
- Origin Private File System support required
- Single desktop installation via PWA install prompt
- Database persists in browser storage (not in repository)

### 5.3 Data Storage
- SQLite database stored in browser OPFS (Origin Private File System)
- Data persists across browser refreshes but is not stored in the git repository
- Schema: orders table, items_lookup table
- No external database servers
- Manual export/import required to backup data outside browser

### 5.4 Design System

- Linear.app inspired dark theme
- Color palette:
  - Background: #0f1115 (surface)
  - Elevated: #161922 (surface-raised)
  - Borders: #272a30
  - Accent: #5e6ad2 (indigo)
  - Text: #ffffff (primary), #6f7682 (muted)
- Clean sans-serif typography (Inter)
- Subtle borders, minimal shadows

## 6. User Stories

As an employee, I want to quickly create a new order with customer details and items so that I can process drop-offs efficiently.

As an employee, I want to see all active orders organized by status so that I know what needs washing, what is ready, and what has been picked up.

As an employee, I want to update an order status with one click so that the workflow stays current without paperwork.

As an owner, I want to search for past orders by phone number so that I can answer customer questions about their previous visits.

As an owner, I want to export my database to a file so that I have a backup in case of hardware failure.

As an owner, I want the app to work without internet so that operations continue during outages.

## 7. Acceptance Criteria

### Order Creation

- Must allow entering customer name (required)
- Must allow entering phone number (optional)
- Must allow adding at least 10 items per order
- Must calculate total automatically
- Must assign sequential order numbers starting from 1
- Must save to database immediately upon creation

### Kanban Board

- Must display four columns with status labels
- Must show order count per column
- Must display customer name, order number, total, and item summary on each card
- Must allow status change via clickable status dots
- Must update in real-time without page refresh
- Must only show non-picked-up orders by default

### Search

- Must return results within 1 second for up to 10,000 orders
- Must support partial matching for names
- Must support exact matching for order numbers
- Must display picked-up orders in search results

### Offline Functionality
- Must load app shell from cache when offline
- Must allow full CRUD operations without network
- Must persist data across browser refreshes using OPFS
- Must auto-save changes every 3 seconds
- Data lives in browser storage, not in repository files

### Backup/Restore

- Must export valid SQLite .db file
- Must import .db file and replace current database
- Must show confirmation after successful import
- Must warn about data replacement before import

## 8. Out of Scope (Future Versions)

- Multi-device synchronization
- Cloud backup
- Customer SMS notifications
- Receipt printing
- Payment processing
- Inventory management
- Employee time tracking
- Analytics dashboard
- Mobile/tablet responsive views
- User authentication/roles

## 9. Success Metrics

- Order creation time under 30 seconds
- Zero data loss during normal operation
- App loads in under 2 seconds on desktop
- Works 100% offline after initial load

## 10. Risks and Mitigations

**Risk: OPFS not available in all browsers**
Mitigation: Document Chrome/Edge requirement clearly; future fallback to IndexedDB

**Risk: Data loss if computer fails**
Mitigation: Prominent backup button; educate users on weekly exports

**Risk: Multiple employees need access simultaneously**
Mitigation: Document single-device limitation; future roadmap includes sync options

## 11. Open Questions

- Should we include keyboard shortcuts for power users?
- Should we add a simple daily revenue summary view?
- Should items be editable by owners or hardcoded?
- What happens when order numbers reach 999999?

## 12. Timeline

**MVP: 1-2 weeks**

- Core database setup
- Order creation form
- Kanban board
- Search functionality
- Backup/restore

**Future: TBD**

- Multi-device support
- Print integration
- Mobile responsive design
