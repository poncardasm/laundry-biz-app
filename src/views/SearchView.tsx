import { useState } from 'react'
import { searchOrders, getOrderItems } from '../db'
import type { Order, OrderItem } from '../db'

interface OrderWithItems extends Order {
  items?: OrderItem[]
}

export default function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<OrderWithItems[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    const orders = searchOrders(query.trim())
    
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: getOrderItems(order.id)
    }))
    
    setResults(ordersWithItems)
    setHasSearched(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      new: '#8a8f98',
      processing: '#5e6ad2',
      ready: '#27a644',
      completed: '#10b981'
    }
    return colors[status] || '#8a8f98'
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 style={{ color: 'var(--color-text-primary)' }}>Search Orders</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Search by customer name, phone, or order ID
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
            placeholder="Enter search query..."
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-md font-medium"
            style={{
              background: 'var(--color-brand-bg)',
              color: 'white'
            }}
          >
            Search
          </button>
        </div>
      </form>

      {hasSearched && (
        <div>
          <div className="mb-4">
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {results.length === 0 ? (
            <div 
              className="p-8 rounded-lg border text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'var(--color-border-standard)'
              }}
            >
              <p style={{ color: 'var(--color-text-tertiary)' }}>No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(order => (
                <div 
                  key={order.id}
                  className="p-4 rounded-lg border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'var(--color-border-standard)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span 
                        className="text-sm font-medium px-2 py-1 rounded"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--color-text-tertiary)'
                        }}
                      >
                        #{order.id}
                      </span>
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          background: getStatusBadgeColor(order.status),
                          color: 'white'
                        }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <span 
                      className="text-lg font-medium"
                      style={{ color: 'var(--color-brand-accent)' }}
                    >
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h3 
                      className="text-base font-medium mb-1"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {order.customer_name}
                    </h3>
                    {order.customer_phone && (
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        Phone: {order.customer_phone}
                      </p>
                    )}
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div 
                      className="mb-3 p-3 rounded"
                      style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                    >
                      <p 
                        className="text-xs font-medium mb-2"
                        style={{ color: 'var(--color-text-quaternary)' }}
                      >
                        ITEMS
                      </p>
                      <div className="space-y-1">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {item.item_name} x{item.quantity}
                            </span>
                            <span style={{ color: 'var(--color-text-tertiary)' }}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <p 
                      className="text-sm mb-3 italic"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      Note: {order.notes}
                    </p>
                  )}

                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-quaternary)' }}
                  >
                    Created: {formatDate(order.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
