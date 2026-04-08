import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../db'
import type { Order } from '../db'
import OrderCard from '../components/OrderCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusColumns = [
  { id: 'new', label: 'New', color: 'bg-muted-foreground' },
  { id: 'processing', label: 'Processing', color: 'bg-primary' },
  { id: 'ready', label: 'Ready', color: 'bg-emerald-500' },
  { id: 'completed', label: 'Completed', color: 'bg-green-500' }
]

export default function BoardView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const allOrders = getOrders()
    setOrders(allOrders)
  }, [refreshKey])

  const handleMoveStatus = (orderId: number, newStatus: string) => {
    updateOrderStatus(orderId, newStatus)
    setRefreshKey(prev => prev + 1)
  }

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = statusColumns.findIndex(col => col.id === currentStatus)
    if (currentIndex < statusColumns.length - 1) {
      return statusColumns[currentIndex + 1].id
    }
    return null
  }

  const getPreviousStatus = (currentStatus: string): string | null => {
    const currentIndex = statusColumns.findIndex(col => col.id === currentStatus)
    if (currentIndex > 0) {
      return statusColumns[currentIndex - 1].id
    }
    return null
  }

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Order Board</h2>
        <p className="mt-1 text-sm text-muted-foreground">Click arrows to move orders between columns</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statusColumns.map(column => {
          const columnOrders = getOrdersByStatus(column.id)
          
          return (
            <div key={column.id} className="flex flex-col">
              <Card className="mb-3">
                <CardHeader className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${column.color}`} />
                      <CardTitle className="text-sm">{column.label}</CardTitle>
                    </div>
                    <Badge variant="secondary">{columnOrders.length}</Badge>
                  </div>
                </CardHeader>
              </Card>

              <div className="flex flex-col gap-2">
                {columnOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onMoveForward={
                      getNextStatus(order.status) 
                        ? () => handleMoveStatus(order.id, getNextStatus(order.status)!)
                        : undefined
                    }
                    onMoveBack={
                      getPreviousStatus(order.status)
                        ? () => handleMoveStatus(order.id, getPreviousStatus(order.status)!)
                        : undefined
                    }
                  />
                ))}

                {columnOrders.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">No orders</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
