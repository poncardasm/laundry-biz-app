import initSqlJs from "sql.js"
import type { Database, QueryExecResult, SqlJsStatic } from "sql.js"

// Database file name in OPFS
const DB_FILE_NAME = "laundry.db"

// SQLite instance
let db: Database | null = null
let sqlJs: SqlJsStatic | null = null

// Default items for the laundry business
const DEFAULT_ITEMS = [
  { name: "Shirt", unit_price: 25 }, // €0.25
  { name: "Pants", unit_price: 35 }, // €0.35
  { name: "Dress", unit_price: 50 }, // €0.50
  { name: "Jacket", unit_price: 60 }, // €0.60
  { name: "Suit", unit_price: 120 }, // €1.20
  { name: "Coat", unit_price: 80 }, // €0.80
]

// Status types
export type OrderStatus = "dropoff" | "washing" | "ready" | "picked"

// Order interface
export interface Order {
  id: number
  customer_name: string
  phone: string
  items_json: string
  total: number
  status: OrderStatus
  created_at: number
  updated_at: number
}

// Item interface
export interface Item {
  name: string
  quantity: number
  unit_price: number
}

// Item lookup interface
export interface ItemLookup {
  name: string
  unit_price: number
}

/**
 * Initialize the database - load from OPFS if exists, or create new
 */
export async function initDB(): Promise<Database> {
  if (db) return db

  // Load sql.js with local WASM file
  const SQL = await initSqlJs({
    locateFile: () => `/sql-wasm.wasm`,
  })
  sqlJs = SQL

  // Try to load existing database from OPFS
  const existingDb = await loadFromOPFS()

  if (existingDb) {
    db = existingDb
    console.log("Database loaded from OPFS")

    // Auto-seed mock data if database is empty
    const orderCount = db.exec("SELECT COUNT(*) FROM orders")
    const count = orderCount[0]?.values[0]?.[0] as number
    if (count === 0) {
      console.log("Empty database detected, auto-seeding mock data...")
      const mockData = await import("./mock-data")
      await mockData.seedMockOrders({ total: 12 })
      await persistDB()
    }
  } else {
    // Create new database
    db = new SQL.Database()
    console.log("New database created")

    // Create schema
    createSchema()

    // Seed default items
    seedItems()

    // Auto-seed mock data for demo
    console.log("Auto-seeding mock data...")
    const mockData = await import("./mock-data")
    await mockData.seedMockOrders({ total: 12 })

    // Save to OPFS
    await persistDB()
  }

  return db
}

/**
 * Get the current database instance
 */
export function getDB(): Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDB() first.")
  }
  return db
}

/**
 * Create database schema
 */
function createSchema(): void {
  if (!db) return

  // Create orders table
  db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT,
            items_json TEXT NOT NULL,
            total INTEGER NOT NULL,
            status TEXT DEFAULT 'dropoff',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    `)

  // Create items_lookup table
  db.run(`
        CREATE TABLE IF NOT EXISTS items_lookup (
            name TEXT PRIMARY KEY,
            unit_price INTEGER NOT NULL
        )
    `)

  console.log("Database schema created")
}

/**
 * Seed default items into items_lookup
 */
function seedItems(): void {
  if (!db) return

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO items_lookup (name, unit_price) VALUES (?, ?)"
  )

  for (const item of DEFAULT_ITEMS) {
    stmt.run([item.name, item.unit_price])
  }

  stmt.free()
  console.log("Default items seeded")
}

/**
 * Load database from OPFS
 */
async function loadFromOPFS(): Promise<Database | null> {
  try {
    // Check if OPFS is available
    if (!navigator.storage || !navigator.storage.getDirectory) {
      console.warn("OPFS not supported in this browser")
      return null
    }

    const root = await navigator.storage.getDirectory()

    try {
      const fileHandle = await root.getFileHandle(DB_FILE_NAME)
      const file = await fileHandle.getFile()
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      if (sqlJs && uint8Array.length > 0) {
        return new sqlJs.Database(uint8Array)
      }
    } catch (e) {
      // File doesn't exist yet
      console.log("No existing database file found in OPFS")
    }
  } catch (e) {
    console.error("Error loading from OPFS:", e)
  }

  return null
}

/**
 * Persist database to OPFS
 */
export async function persistDB(): Promise<void> {
  if (!db) {
    console.warn("No database to persist")
    return
  }

  try {
    // Check if OPFS is available
    if (!navigator.storage || !navigator.storage.getDirectory) {
      console.warn("OPFS not supported in this browser")
      return
    }

    const root = await navigator.storage.getDirectory()
    const fileHandle = await root.getFileHandle(DB_FILE_NAME, { create: true })
    const writable = await fileHandle.createWritable()

    // Export database as binary
    const data = db.export()

    // Convert Uint8Array to ArrayBuffer for writing
    const buffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength
    ) as ArrayBuffer
    await writable.write(buffer)
    await writable.close()

    console.log("Database persisted to OPFS")
  } catch (e) {
    console.error("Error persisting to OPFS:", e)
  }
}

/**
 * Export database as downloadable file
 */
export function exportDB(): Blob {
  if (!db) {
    throw new Error("Database not initialized")
  }

  const data = db.export()
  // Convert Uint8Array to ArrayBuffer for Blob
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer
  return new Blob([buffer], { type: "application/octet-stream" })
}

/**
 * Import database from file
 */
export async function importDB(arrayBuffer: ArrayBuffer): Promise<void> {
  if (!sqlJs) {
    throw new Error("SQL.js not initialized")
  }

  const uint8Array = new Uint8Array(arrayBuffer)

  // Close existing database
  if (db) {
    db.close()
  }

  // Create new database from imported data
  db = new sqlJs.Database(uint8Array)

  // Persist to OPFS
  await persistDB()

  console.log("Database imported successfully")
}

/**
 * Auto-save database every 3 seconds
 */
export function startAutoSave(): void {
  setInterval(() => {
    persistDB()
  }, 3000)
}

/**
 * Emergency save on pagehide
 */
export function setupEmergencySave(): void {
  window.addEventListener("pagehide", () => {
    if (db) {
      const data = db.export()

      // Use synchronous approach for pagehide
      try {
        const request = indexedDB.open("laundry-emergency", 1)
        request.onupgradeneeded = () => {
          const database = request.result
          if (!database.objectStoreNames.contains("backups")) {
            database.createObjectStore("backups")
          }
        }
        request.onsuccess = () => {
          const database = request.result
          const transaction = database.transaction(["backups"], "readwrite")
          const store = transaction.objectStore("backups")
          store.put(data, "last-backup")
        }
      } catch (e) {
        console.error("Emergency save failed:", e)
      }
    }
  })
}

// ==================== ORDER OPERATIONS ====================

/**
 * Create a new order
 */
export function createOrder(
  customerName: string,
  phone: string,
  items: Item[]
): number {
  if (!db) throw new Error("Database not initialized")

  const total = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )
  const now = Math.floor(Date.now() / 1000)
  const itemsJson = JSON.stringify(items)

  const stmt = db.prepare(`
        INSERT INTO orders (customer_name, phone, items_json, total, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'dropoff', ?, ?)
    `)

  stmt.run([customerName, phone, itemsJson, total, now, now])
  stmt.free()

  // Get the last inserted ID
  const result = db.exec("SELECT last_insert_rowid()")
  const orderId = result[0]?.values[0]?.[0] as number

  // Persist changes
  persistDB()

  return orderId
}

/**
 * Get all orders (excluding picked up by default)
 */
export function getOrders(includePicked: boolean = false): Order[] {
  if (!db) throw new Error("Database not initialized")

  let query = "SELECT * FROM orders"
  if (!includePicked) {
    query += " WHERE status != 'picked'"
  }
  query += " ORDER BY updated_at DESC"

  const result = db.exec(query)

  if (result.length === 0 || result[0].values.length === 0) {
    return []
  }

  return parseOrders(result[0])
}

/**
 * Get orders by status
 */
export function getOrdersByStatus(status: OrderStatus): Order[] {
  if (!db) throw new Error("Database not initialized")

  // Use exec for proper results
  const execResult = db.exec(
    `SELECT * FROM orders WHERE status = '${status}' ORDER BY updated_at DESC`
  )

  if (execResult.length === 0 || execResult[0].values.length === 0) {
    return []
  }

  return parseOrders(execResult[0])
}

/**
 * Update order status
 */
export function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus
): void {
  if (!db) throw new Error("Database not initialized")

  const now = Math.floor(Date.now() / 1000)

  const stmt = db.prepare(`
        UPDATE orders SET status = ?, updated_at = ? WHERE id = ?
    `)

  stmt.run([newStatus, now, orderId])
  stmt.free()

  // Persist changes
  persistDB()
}

/**
 * Search orders by name, phone, or ID
 */
export function searchOrders(query: string): Order[] {
  if (!db) throw new Error("Database not initialized")

  const escapedQuery = query.replace(/'/g, "''")
  const exactId = parseInt(query, 10)

  const execSql = isNaN(exactId)
    ? `SELECT * FROM orders WHERE customer_name LIKE '%${escapedQuery}%' OR phone LIKE '%${escapedQuery}%' ORDER BY updated_at DESC`
    : `SELECT * FROM orders WHERE id = ${exactId} OR customer_name LIKE '%${escapedQuery}%' OR phone LIKE '%${escapedQuery}%' ORDER BY updated_at DESC`

  const result = db.exec(execSql)

  if (result.length === 0 || result[0].values.length === 0) {
    return []
  }

  return parseOrders(result[0])
}

/**
 * Get all items from lookup table
 */
export function getItems(): ItemLookup[] {
  if (!db) throw new Error("Database not initialized")

  const result = db.exec("SELECT * FROM items_lookup ORDER BY name")

  if (result.length === 0 || result[0].values.length === 0) {
    return []
  }

  const columns = result[0].columns
  return result[0].values.map(
    (row: (string | number | null | Uint8Array)[]) => ({
      name: row[columns.indexOf("name")] as string,
      unit_price: row[columns.indexOf("unit_price")] as number,
    })
  )
}

/**
 * Get item price by name
 */
export function getItemPrice(name: string): number | null {
  if (!db) throw new Error("Database not initialized")

  const result = db.exec(
    `SELECT unit_price FROM items_lookup WHERE name = '${name.replace(/'/g, "''")}'`
  )

  if (result.length === 0 || result[0].values.length === 0) {
    return null
  }

  return result[0].values[0][0] as number
}

/**
 * Parse query results into Order objects
 */
function parseOrders(result: QueryExecResult): Order[] {
  const columns = result.columns

  return result.values.map((row: (string | number | null | Uint8Array)[]) => ({
    id: row[columns.indexOf("id")] as number,
    customer_name: row[columns.indexOf("customer_name")] as string,
    phone: (row[columns.indexOf("phone")] as string) || "",
    items_json: row[columns.indexOf("items_json")] as string,
    total: row[columns.indexOf("total")] as number,
    status: row[columns.indexOf("status")] as OrderStatus,
    created_at: row[columns.indexOf("created_at")] as number,
    updated_at: row[columns.indexOf("updated_at")] as number,
  }))
}

/**
 * Format price from cents to currency string
 */
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

/**
 * Parse items JSON
 */
export function parseItems(itemsJson: string): Item[] {
  try {
    return JSON.parse(itemsJson) as Item[]
  } catch {
    return []
  }
}

/**
 * Format item summary
 */
export function formatItemSummary(items: Item[]): string {
  return items.map((item) => `${item.quantity}x ${item.name}`).join(", ")
}

/**
 * Format date from unix timestamp
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString()
}

/**
 * Seed database with mock data for testing/demo
 */
export async function seedMockData(options?: {
  total?: number
  quick?: boolean
  large?: number
}): Promise<void> {
  const mockData = await import("./mock-data")

  if (options?.quick) {
    await Promise.resolve(mockData.seedQuickMockData())
  } else if (options?.large) {
    await mockData.seedLargeMockDataset(options.large)
  } else {
    await mockData.seedMockOrders({ total: options?.total || 15 })
  }

  mockData.printOrderSummary()
}

/**
 * Clear all orders from the database (keeps items_lookup)
 */
export function clearAllOrders(): void {
  if (!db) throw new Error("Database not initialized")

  db.run("DELETE FROM orders")
  persistDB()
  console.log("✅ All orders cleared")
}

// Make functions available in browser console for debugging
if (typeof window !== "undefined") {
  ;(window as unknown as Record<string, unknown>).laundryDB = {
    seedMockData,
    clearAllOrders,
    getOrders: () => getOrders(true),
    exportDB,
  }
}
