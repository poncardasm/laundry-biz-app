import { useState, useEffect, useCallback } from "react"
import type { Order, OrderStatus } from "@/db"
import {
  getOrdersByStatus,
  updateOrderStatus,
  formatPrice,
  parseItems,
  formatItemSummary,
  formatDate,
} from "@/db"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const STATUSES: {
  id: OrderStatus
  label: string
  color: string
  dotColor: string
}[] = [
  {
    id: "dropoff",
    label: "Drop-off",
    color: "bg-violet-500",
    dotColor: "bg-violet-500",
  },
  {
    id: "washing",
    label: "Washing",
    color: "bg-blue-500",
    dotColor: "bg-blue-500",
  },
  {
    id: "ready",
    label: "Ready",
    color: "bg-green-500",
    dotColor: "bg-green-500",
  },
  {
    id: "picked",
    label: "Picked Up",
    color: "bg-gray-500",
    dotColor: "bg-gray-500",
  },
]

const STATUS_ORDER: OrderStatus[] = ["dropoff", "washing", "ready", "picked"]

export function BoardView() {
  const [orders, setOrders] = useState<Record<OrderStatus, Order[]>>({
    dropoff: [],
    washing: [],
    ready: [],
    picked: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadOrders = useCallback(() => {
    try {
      const newOrders: Record<OrderStatus, Order[]> = {
        dropoff: [],
        washing: [],
        ready: [],
        picked: [],
      }

      // Load orders for each status
      for (const status of STATUS_ORDER) {
        newOrders[status] = getOrdersByStatus(status)
      }

      setOrders(newOrders)
    } catch (err) {
      console.error("Error loading orders:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()

    // Refresh every 2 seconds to catch updates
    const interval = setInterval(loadOrders, 2000)
    return () => clearInterval(interval)
  }, [loadOrders])

  const handleMoveStatus = (
    orderId: number,
    currentStatus: OrderStatus,
    direction: "forward" | "backward"
  ) => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus)
    const newIndex =
      direction === "forward" ? currentIndex + 1 : currentIndex - 1

    if (newIndex >= 0 && newIndex < STATUS_ORDER.length) {
      const newStatus = STATUS_ORDER[newIndex]
      updateOrderStatus(orderId, newStatus)
      loadOrders()
    }
  }

  const totalActiveOrders =
    orders.dropoff.length + orders.washing.length + orders.ready.length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Orders Board
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalActiveOrders} active orders
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid h-full grid-cols-4 gap-4">
          {STATUSES.slice(0, 3).map((status) => (
            <Column
              key={status.id}
              status={status}
              orders={orders[status.id]}
              onMoveStatus={handleMoveStatus}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ColumnProps {
  status: (typeof STATUSES)[0]
  orders: Order[]
  onMoveStatus: (
    orderId: number,
    currentStatus: OrderStatus,
    direction: "forward" | "backward"
  ) => void
  isLoading: boolean
}

function Column({ status, orders, onMoveStatus, isLoading }: ColumnProps) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className={cn("h-2 w-2 rounded-full", status.dotColor)} />
        <span className="font-medium text-foreground">{status.label}</span>
        <Badge
          variant="secondary"
          className="ml-auto bg-secondary text-muted-foreground"
        >
          {orders.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-2 p-3">
          {isLoading ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No orders
            </div>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onMoveStatus={onMoveStatus}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface OrderCardProps {
  order: Order
  onMoveStatus: (
    orderId: number,
    currentStatus: OrderStatus,
    direction: "forward" | "backward"
  ) => void
}

function OrderCard({ order, onMoveStatus }: OrderCardProps) {
  const items = parseItems(order.items_json)
  const currentIndex = STATUS_ORDER.indexOf(order.status)
  const canMoveBackward = currentIndex > 0
  const canMoveForward = currentIndex < STATUS_ORDER.length - 1

  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-3 pb-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">
              Order #{order.id}
            </div>
            <div className="font-medium text-card-foreground">
              {order.customer_name}
            </div>
          </div>
          <div className="text-sm font-semibold text-card-foreground">
            {formatPrice(order.total)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        {order.phone && (
          <div className="mb-2 text-xs text-muted-foreground">
            {order.phone}
          </div>
        )}
        <div className="mb-3 text-xs text-muted-foreground">
          {formatItemSummary(items)}
        </div>

        {/* Status transition dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {canMoveBackward && (
              <button
                onClick={() => onMoveStatus(order.id, order.status, "backward")}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Move back"
              >
                ←
              </button>
            )}
            {canMoveForward && (
              <button
                onClick={() => onMoveStatus(order.id, order.status, "forward")}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                title="Move forward"
              >
                →
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(order.updated_at)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
