# Laundry Biz App

An offline-first Progressive Web Application for laundry business owners and employees to manage daily operations without relying on internet connectivity or cloud services.

## Features

- **Order Management**: Create new orders with customer details and multiple items
- **Kanban Workflow**: Track orders through 4 status stages (Drop-off, Washing, Ready, Picked Up)
- **Search**: Find orders by customer name, phone number, or order ID
- **Data Persistence**: Automatic save to Origin Private File System (OPFS) every 3 seconds
- **Backup & Restore**: Export and import SQLite database files
- **Offline Support**: Works 100% offline after initial load
- **PWA**: Installable as a desktop app

## Technology Stack

- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- sql.js (SQLite WASM)
- Vite with PWA plugin
- Origin Private File System (OPFS) for storage

## Browser Requirements

- Chrome 109+ or Edge 109+
- Origin Private File System support required
- Single desktop installation via PWA install prompt

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd laundry-biz-app
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The production files will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

## Data Storage

This app uses the **Origin Private File System (OPFS)** to store data locally in your browser. This means:

- Data persists across browser restarts
- No internet connection required
- Data is not synced to any cloud service
- Data is only accessible from this browser on this device

**Important**: The database file is NOT stored in this git repository. To backup your data, use the Export feature in the Backup & Restore section.

## Default Items and Pricing

The app comes with pre-configured items:

- Shirt: €0.25
- Pants: €0.35
- Dress: €0.50
- Jacket: €0.60
- Suit: €1.20
- Coat: €0.80

## Project Structure

```
laundry-biz-app/
├── docs/                    # Documentation
├── public/                  # Static assets
│   └── icon.svg            # PWA icon
├── src/
│   ├── components/         # UI components
│   │   ├── ui/            # shadcn components
│   │   └── Sidebar.tsx    # Navigation sidebar
│   ├── views/             # Page views
│   │   ├── BoardView.tsx      # Kanban board
│   │   ├── NewOrderView.tsx   # Create order form
│   │   ├── SearchView.tsx     # Search functionality
│   │   └── BackupView.tsx     # Backup/restore
│   ├── db.ts             # Database layer
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

## Backup and Restore

### Export Database

1. Navigate to the "Backup & Restore" section
2. Click "Export to File"
3. Save the `.db` file to a safe location

### Import Database

1. Navigate to the "Backup & Restore" section
2. Click "Select Backup File"
3. Choose a previously exported `.db` file
4. Confirm the import (this will replace all current data)

## Troubleshooting

### Database not initializing

- Ensure you're using Chrome or Edge with OPFS support
- Check browser console for error messages
- Try clearing site data in DevTools and reloading

### Data not persisting

- OPFS requires a secure context (HTTPS or localhost)
- Check that your browser supports OPFS
- Try the "Force Save Now" button in Backup & Restore

## Development Notes

### Database Schema

**orders table:**

- id: INTEGER PRIMARY KEY AUTOINCREMENT
- customer_name: TEXT NOT NULL
- phone: TEXT
- items_json: TEXT NOT NULL (JSON array of items)
- total: INTEGER NOT NULL (cents, to avoid floating point)
- status: TEXT DEFAULT 'dropoff'
- created_at: INTEGER (unix epoch)
- updated_at: INTEGER (unix epoch)

**items_lookup table:**

- name: TEXT PRIMARY KEY
- unit_price: INTEGER NOT NULL (cents)

### Auto-save Strategy

- Runs every 3 seconds during active use
- Also triggers on order creation and status updates
- Emergency save on pagehide event

## License

MIT

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- SQLite powered by [sql.js](https://sql.js.org/)
- Icons by [Lucide](https://lucide.dev/)
