import { useState } from 'react'
import { searchOrders, getOrderItems } from '../db'
import type { Order, OrderItem } from '../db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SearchIcon } from 'lucide-react'

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'secondary',
      processing: 'default',
      ready: 'outline',
      completed: 'outline'
    }
    return colors[status] || 'secondary'
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Search Orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Search by customer name, phone, or order ID
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query..."
            className="flex-1"
          />
          <Button type="submit">
            <SearchIcon data-icon="inline-start" />
            Search
          </Button>
        </div>
      </form>

      {hasSearched && (
        <div>
          <div className="mb-4">
            <span className="text-sm text-muted-foreground">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No orders found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map(order => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">#{order.id}</Badge>
                        <Badge variant={getStatusColor(order.status) as "default" | "secondary" | "outline" | "destructive"}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <span className="text-lg font-medium text-primary">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <CardTitle className="text-base mb-1">{order.customer_name}</CardTitle>
                      {order.customer_phone && (
                        <p className="text-sm text-muted-foreground">
                          Phone: {order.customer_phone}
                        </p>
                      )}
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mb-3 p-3 rounded-md bg-muted">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">
                          ITEMS
                        </p>
                        <div className="flex flex-col gap-1">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-foreground">
                                {item.item_name} x{item.quantity}
                              </span>
                              <span className="text-muted-foreground">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.notes && (
                      <p className="text-sm mb-3 italic text-muted-foreground">
                        Note: {order.notes}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Created: {formatDate(order.created_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
