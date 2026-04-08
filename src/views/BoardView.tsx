import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../db'
import type { Order } from '../db'
import OrderCard from '../components/OrderCard'

const statusColumns = [
  { id: 'new', label: 'New', color: '#8a8f98' },
  { id: 'processing', label: 'Processing', color: '#5e6ad2' },
  { id: 'ready', label: 'Ready', color: '#27a644' },
  { id: 'completed', label: 'Completed', color: '#10b981' }
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
        <h2 style={{ color: 'var(--color-text-primary)' }}>
          Order Board
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Click status dots to move orders
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statusColumns.map(column => {
          const columnOrders = getOrdersByStatus(column.id)
          
          return (
            <div key={column.id} className="flex flex-col">
              <div 
                className="px-3 py-2 rounded-md mb-3 flex items-center justify-between"
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: column.color }}
                  />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {column.label}
                  </span>
                </div>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--color-text-tertiary)'
                  }}
                >
                  {columnOrders.length}
                </span>
              </div>

              <div className="space-y-2">
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
                  <div 
                    className="px-4 py-8 rounded-md text-center border border-dashed"
                    style={{
                      borderColor: 'var(--color-border-subtle)',
                      color: 'var(--color-text-quaternary)'
                    }}
                  >
                    <p className="text-sm">No orders</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
