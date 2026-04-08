import { createOrder, type Item, formatPrice, getOrders } from "./db"

// Re-declare OrderStatus type to avoid circular dependency
export type OrderStatus = "dropoff" | "washing" | "ready" | "picked"

// Mock data for populating the laundry business database

// Sample customer data - Filipino names
const CUSTOMERS = [
  { name: "Maria Santos", phone: "+63 917 123 4567" },
  { name: "Juan Dela Cruz", phone: "+63 918 234 5678" },
  { name: "Ana Reyes", phone: "+63 919 345 6789" },
  { name: "Jose Garcia", phone: "+63 920 456 7890" },
  { name: "Linda Torres", phone: "+63 921 567 8901" },
  { name: "Pedro Aquino", phone: "+63 922 678 9012" },
  { name: "Elena Fernandez", phone: "+63 923 789 0123" },
  { name: "Miguel Cruz", phone: "+63 924 890 1234" },
  { name: "Carmen Villanueva", phone: "+63 925 901 2345" },
  { name: "Ramon Lim", phone: "+63 926 012 3456" },
  { name: "Rosario Bautista", phone: "+63 927 123 4567" },
  { name: "Fernando Ramos", phone: "+63 928 234 5678" },
  { name: "Patricia Mendoza", phone: "+63 929 345 6789" },
  { name: "Antonio Flores", phone: "+63 930 456 7890" },
  { name: "Dolores Castro", phone: "+63 931 567 8901" },
]

// Available item types with prices
const ITEM_TYPES = [
  { name: "Shirt", unit_price: 25 },
  { name: "Pants", unit_price: 35 },
  { name: "Dress", unit_price: 50 },
  { name: "Jacket", unit_price: 60 },
  { name: "Suit", unit_price: 120 },
  { name: "Coat", unit_price: 80 },
]

// Random number generator helpers
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randomChoice = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

// Generate random items for an order
const generateRandomItems = (): Item[] => {
  const numItemTypes = randomInt(1, 3) // 1-3 different types of items per order
  const items: Item[] = []
  const usedTypes = new Set<string>()

  for (let i = 0; i < numItemTypes; i++) {
    let itemType: { name: string; unit_price: number }
    do {
      itemType = randomChoice(ITEM_TYPES)
    } while (usedTypes.has(itemType.name))

    usedTypes.add(itemType.name)
    items.push({
      name: itemType.name,
      quantity: randomInt(1, 5),
      unit_price: itemType.unit_price,
    })
  }

  return items
}

// Calculate total price for items
const calculateTotal = (items: Item[]): number =>
  items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

// Mock order templates with realistic scenarios - Filipino customers
const ORDER_SCENARIOS = [
  {
    name: "Maria Santos",
    items: [{ name: "Shirt", quantity: 3, unit_price: 25 }],
  },
  {
    name: "Juan Dela Cruz",
    items: [{ name: "Dress", quantity: 2, unit_price: 50 }],
  },
  {
    name: "Ana Reyes",
    items: [
      { name: "Suit", quantity: 1, unit_price: 120 },
      { name: "Shirt", quantity: 2, unit_price: 25 },
    ],
  },
  {
    name: "Jose Garcia",
    items: [{ name: "Coat", quantity: 1, unit_price: 80 }],
  },
  {
    name: "Linda Torres",
    items: [
      { name: "Pants", quantity: 2, unit_price: 35 },
      { name: "Shirt", quantity: 4, unit_price: 25 },
    ],
  },
  {
    name: "Pedro Aquino",
    items: [
      { name: "Dress", quantity: 1, unit_price: 50 },
      { name: "Jacket", quantity: 1, unit_price: 60 },
    ],
  },
  {
    name: "Elena Fernandez",
    items: [{ name: "Jacket", quantity: 2, unit_price: 60 }],
  },
  {
    name: "Miguel Cruz",
    items: [
      { name: "Shirt", quantity: 5, unit_price: 25 },
      { name: "Pants", quantity: 2, unit_price: 35 },
    ],
  },
  {
    name: "Carmen Villanueva",
    items: [{ name: "Suit", quantity: 2, unit_price: 120 }],
  },
  {
    name: "Ramon Lim",
    items: [
      { name: "Coat", quantity: 1, unit_price: 80 },
      { name: "Dress", quantity: 2, unit_price: 50 },
    ],
  },
  {
    name: "Rosario Bautista",
    items: [{ name: "Pants", quantity: 3, unit_price: 35 }],
  },
  {
    name: "Fernando Ramos",
    items: [
      { name: "Shirt", quantity: 2, unit_price: 25 },
      { name: "Jacket", quantity: 1, unit_price: 60 },
    ],
  },
  {
    name: "Patricia Mendoza",
    items: [{ name: "Dress", quantity: 3, unit_price: 50 }],
  },
  {
    name: "Antonio Flores",
    items: [
      { name: "Coat", quantity: 2, unit_price: 80 },
      { name: "Shirt", quantity: 3, unit_price: 25 },
    ],
  },
  {
    name: "Dolores Castro",
    items: [
      { name: "Suit", quantity: 1, unit_price: 120 },
      { name: "Pants", quantity: 1, unit_price: 35 },
      { name: "Shirt", quantity: 1, unit_price: 25 },
    ],
  },
]

// Phone lookup by customer name
const getPhoneForCustomer = (name: string): string => {
  const customer = CUSTOMERS.find((c) => c.name === name)
  return customer?.phone || ""
}

/**
 * Create a single mock order
 */
export function createMockOrder(
  customerName?: string,
  customItems?: Item[]
): number {
  const scenario = customerName
    ? ORDER_SCENARIOS.find((s) => s.name === customerName)
    : randomChoice(ORDER_SCENARIOS)

  const name = customerName || scenario?.name || randomChoice(CUSTOMERS).name
  const phone = getPhoneForCustomer(name)
  const items = customItems || scenario?.items || generateRandomItems()

  return createOrder(name, phone, items)
}

/**
 * Create multiple mock orders with realistic distribution across statuses
 */
export async function seedMockOrders(
  options: {
    total?: number
    distribution?: Record<OrderStatus, number>
  } = {}
): Promise<{ created: number; ordersByStatus: Record<OrderStatus, number> }> {
  const total = options.total || 15

  // Default distribution: 40% dropoff, 30% washing, 20% ready, 10% picked
  const distribution = options.distribution || {
    dropoff: Math.floor(total * 0.4),
    washing: Math.floor(total * 0.3),
    ready: Math.floor(total * 0.2),
    picked:
      total -
      Math.floor(total * 0.4) -
      Math.floor(total * 0.3) -
      Math.floor(total * 0.2),
  }

  const ordersByStatus: Record<OrderStatus, number> = {
    dropoff: 0,
    washing: 0,
    ready: 0,
    picked: 0,
  }

  const orderIds: number[] = []

  // Create orders for each status (all start as 'dropoff')
  for (let i = 0; i < total && i < ORDER_SCENARIOS.length; i++) {
    const scenario = ORDER_SCENARIOS[i]
    const phone = getPhoneForCustomer(scenario.name)
    const id = createOrder(scenario.name, phone, scenario.items)
    orderIds.push(id)
  }

  // Update statuses to match distribution
  const { updateOrderStatus } = await import("./db")
  let orderIndex = 0

  for (const [status, count] of Object.entries(distribution) as [
    OrderStatus,
    number,
  ][]) {
    for (let i = 0; i < count && orderIndex < orderIds.length; i++) {
      if (status !== "dropoff") {
        updateOrderStatus(orderIds[orderIndex], status)
      }
      ordersByStatus[status]++
      orderIndex++
    }
  }

  console.log(`✅ Created ${orderIds.length} mock orders`)
  console.log("📊 Distribution:", ordersByStatus)

  return { created: orderIds.length, ordersByStatus }
}

/**
 * Create a small set of sample data for quick testing
 */
export function seedQuickMockData(): { created: number; orderIds: number[] } {
  const orderIds: number[] = []

  // Create 5 quick sample orders
  const quickScenarios = ORDER_SCENARIOS.slice(0, 5)

  for (const scenario of quickScenarios) {
    const phone = getPhoneForCustomer(scenario.name)
    const id = createOrder(scenario.name, phone, scenario.items)
    orderIds.push(id)
  }

  console.log(`✅ Created ${orderIds.length} quick mock orders`)
  return { created: orderIds.length, orderIds }
}

/**
 * Create a large dataset for load testing
 */
export async function seedLargeMockDataset(count: number = 50): Promise<{
  created: number
  totalValue: number
}> {
  const orderIds: number[] = []
  let totalValue = 0

  for (let i = 0; i < count; i++) {
    const customer = randomChoice(CUSTOMERS)
    const items = generateRandomItems()
    totalValue += calculateTotal(items)

    const id = createOrder(customer.name, customer.phone, items)
    orderIds.push(id)
  }

  // Randomly distribute across statuses
  const { updateOrderStatus } = await import("./db")
  const statusWeights: OrderStatus[] = [
    ...Array(4).fill("dropoff"),
    ...Array(3).fill("washing"),
    ...Array(2).fill("ready"),
    ...Array(1).fill("picked"),
  ] as OrderStatus[]

  for (let i = 1; i <= orderIds.length; i++) {
    const randomStatus = randomChoice(statusWeights)
    if (randomStatus !== "dropoff") {
      updateOrderStatus(i, randomStatus)
    }
  }

  console.log(
    `✅ Created ${orderIds.length} mock orders (total value: ${formatPrice(totalValue)})`
  )

  return { created: orderIds.length, totalValue }
}

/**
 * Print summary of current orders in database
 */
export function printOrderSummary(): void {
  const allOrders = getOrders(true)
  const activeOrders = getOrders(false)

  console.log("\n📋 Order Summary")
  console.log("=================")
  console.log(`Total orders: ${allOrders.length}`)
  console.log(`Active orders: ${activeOrders.length}`)

  const byStatus = allOrders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    {} as Record<OrderStatus, number>
  )

  console.log("\nBy status:")
  for (const [status, count] of Object.entries(byStatus)) {
    console.log(`  ${status}: ${count}`)
  }

  const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0)
  console.log(`\n💰 Total revenue: ${formatPrice(totalRevenue)}`)
}

// Default export with all functions
export default {
  seedMockOrders,
  seedQuickMockData,
  seedLargeMockDataset,
  createMockOrder,
  printOrderSummary,
}
