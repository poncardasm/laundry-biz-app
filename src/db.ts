import initSqlJs, { type Database } from 'sql.js';

let db: Database | null = null;
let saveInterval: number | null = null;

const DB_NAME = 'laundry-biz.db';

export async function initDB(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `/${file}`
  });

  const hasOPFS = 'storage' in navigator && 'getDirectory' in navigator.storage;
  
  if (hasOPFS) {
    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(DB_NAME);
      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      db = new SQL.Database(uint8Array);
      console.log('Database loaded from OPFS');
    } catch (error) {
      console.log('Creating new database');
      db = new SQL.Database();
      createSchema();
    }
  } else {
    console.log('OPFS not supported, using in-memory database');
    db = new SQL.Database();
    createSchema();
  }

  startAutoSave();
  
  window.addEventListener('pagehide', () => {
    persistDB().catch(console.error);
  });

  return db;
}

function createSchema(): void {
  if (!db) return;

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      notes TEXT,
      status TEXT DEFAULT 'new',
      total REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items_lookup (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      price REAL NOT NULL
    )
  `);

  const count = db.exec("SELECT COUNT(*) FROM items_lookup");
  if (count.length === 0 || count[0].values[0][0] === 0) {
    const defaultItems = [
      ['Shirt', 150],
      ['Pants', 200],
      ['Dress', 300],
      ['Jacket', 350],
      ['Suit', 500],
      ['Coat', 400]
    ];

    const stmt = db.prepare("INSERT INTO items_lookup (name, price) VALUES (?, ?)");
    defaultItems.forEach(([name, price]) => {
      stmt.run([name, price]);
    });
    stmt.free();
    
    console.log('Default items seeded');
  }
}

export async function persistDB(): Promise<void> {
  if (!db) return;

  const hasOPFS = 'storage' in navigator && 'getDirectory' in navigator.storage;
  
  if (hasOPFS) {
    try {
      const data = db.export();
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(DB_NAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(new Uint8Array(data).buffer);
      await writable.close();
      console.log('Database saved to OPFS');
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }
}

function startAutoSave(): void {
  if (saveInterval) clearInterval(saveInterval);
  
  saveInterval = window.setInterval(() => {
    persistDB().catch(console.error);
  }, 3000);
}

export function exportDB(): Uint8Array | null {
  if (!db) return null;
  return db.export();
}

export async function importDB(data: Uint8Array): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file) => `/${file}`
  });

  if (db) {
    db.close();
  }

  db = new SQL.Database(data);
  console.log('Database imported successfully');
  await persistDB();
}

export interface Item {
  id: number;
  name: string;
  price: number;
}

export function getItems(): Item[] {
  if (!db) return [];
  
  const result = db.exec("SELECT id, name, price FROM items_lookup ORDER BY name");
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as number,
    name: row[1] as string,
    price: row[2] as number
  }));
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string | null;
  notes: string | null;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_name: string;
  quantity: number;
  price: number;
}

export function createOrder(
  customerName: string,
  customerPhone: string | null,
  notes: string | null,
  items: Array<{ itemName: string; quantity: number; price: number }>
): number {
  if (!db) throw new Error('Database not initialized');

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  db.run(
    "INSERT INTO orders (customer_name, customer_phone, notes, total) VALUES (?, ?, ?, ?)",
    [customerName, customerPhone, notes, total]
  );

  const orderId = db.exec("SELECT last_insert_rowid()")[0].values[0][0] as number;

  const stmt = db.prepare("INSERT INTO items (order_id, item_name, quantity, price) VALUES (?, ?, ?, ?)");
  items.forEach(item => {
    stmt.run([orderId, item.itemName, item.quantity, item.price]);
  });
  stmt.free();

  return orderId;
}

export function getOrders(status?: string): Order[] {
  if (!db) return [];

  let query = "SELECT * FROM orders";
  const params: any[] = [];

  if (status) {
    query += " WHERE status = ?";
    params.push(status);
  }

  query += " ORDER BY updated_at DESC";

  const result = db.exec(query);

  if (result.length === 0) return [];

  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as Order;
  });
}

export function getOrderById(id: number): Order | null {
  if (!db) return null;

  const result = db.exec("SELECT * FROM orders WHERE id = ?", [id]);

  if (result.length === 0) return null;

  const columns = result[0].columns;
  const row = result[0].values[0];
  const obj: any = {};
  columns.forEach((col, idx) => {
    obj[col] = row[idx];
  });

  return obj as Order;
}

export function getOrderItems(orderId: number): OrderItem[] {
  if (!db) return [];

  const result = db.exec("SELECT * FROM items WHERE order_id = ?", [orderId]);

  if (result.length === 0) return [];

  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as OrderItem;
  });
}

export function updateOrderStatus(id: number, status: string): void {
  if (!db) return;

  db.run(
    "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, id]
  );
}

export function searchOrders(query: string): Order[] {
  if (!db) return [];

  const searchTerm = `%${query}%`;
  const result = db.exec(
    `SELECT DISTINCT orders.* FROM orders 
     LEFT JOIN items ON orders.id = items.order_id
     WHERE orders.customer_name LIKE ? 
     OR orders.customer_phone LIKE ? 
     OR CAST(orders.id AS TEXT) = ?
     ORDER BY orders.updated_at DESC`,
    [searchTerm, searchTerm, query]
  );

  if (result.length === 0) return [];

  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as Order;
  });
}

export function deleteOrder(id: number): void {
  if (!db) return;

  db.run("DELETE FROM items WHERE order_id = ?", [id]);
  db.run("DELETE FROM orders WHERE id = ?", [id]);
}
