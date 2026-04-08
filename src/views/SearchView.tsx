import { useState, useCallback } from "react"
import type { Order, OrderStatus } from "@/db"
import {
  searchOrders,
  formatPrice,
  parseItems,
  formatItemSummary,
  formatDate,
} from "@/db"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

const statusColors: Record<
  OrderStatus,
  { bg: string; text: string; label: string }
> = {
  dropoff: {
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    label: "Drop-off",
  },
  washing: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Washing" },
  ready: { bg: "bg-green-500/20", text: "text-green-400", label: "Ready" },
  picked: { bg: "bg-gray-500/20", text: "text-gray-400", label: "Picked Up" },
}

export function SearchView() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Order[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(true)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const orders = searchOrders(query.trim())
      setResults(orders)
    } catch (err) {
      console.error("Error searching orders:", err)
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setHasSearched(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#272a30] px-6 py-4">
        <h1 className="text-xl font-semibold text-white">Search Orders</h1>
        <p className="text-sm text-[#6f7682]">
          Search by name, phone number, or order ID
        </p>
      </div>

      <div className="border-b border-[#272a30] p-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6f7682]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by customer name, phone, or order #..."
                className="border-[#272a30] bg-[#161922] pl-10 text-white placeholder:text-[#6f7682]"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6f7682] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-[#5e6ad2] text-white hover:bg-[#4f5ab8]"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <ScrollArea className="h-full">
          <div className="mx-auto max-w-4xl">
            {!hasSearched ? (
              <div className="py-12 text-center">
                <Search className="mx-auto h-12 w-12 text-[#6f7682]" />
                <p className="mt-4 text-[#6f7682]">
                  Enter a search term to find orders
                </p>
              </div>
            ) : isLoading ? (
              <div className="py-12 text-center">
                <p className="text-[#6f7682]">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#6f7682]">No orders found</p>
                <p className="mt-1 text-sm text-[#6f7682]">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="mb-4 text-sm text-[#6f7682]">
                  {results.length} result{results.length !== 1 ? "s" : ""} found
                </p>
                {results.map((order) => (
                  <OrderResultCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

interface OrderResultCardProps {
  order: Order
}

function OrderResultCard({ order }: OrderResultCardProps) {
  const items = parseItems(order.items_json)
  const statusStyle = statusColors[order.status]

  return (
    <Card className="border-[#272a30] bg-[#161922]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">
                Order #{order.id}
              </span>
              <Badge
                className={cn(statusStyle.bg, statusStyle.text, "border-0")}
              >
                {statusStyle.label}
              </Badge>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#6f7682]">Customer</div>
                <div className="font-medium text-white">
                  {order.customer_name}
                </div>
              </div>

              {order.phone && (
                <div>
                  <div className="text-xs text-[#6f7682]">Phone</div>
                  <div className="text-white">{order.phone}</div>
                </div>
              )}

              <div>
                <div className="text-xs text-[#6f7682]">Total</div>
                <div className="font-medium text-white">
                  {formatPrice(order.total)}
                </div>
              </div>

              <div>
                <div className="text-xs text-[#6f7682]">Created</div>
                <div className="text-white">{formatDate(order.created_at)}</div>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xs text-[#6f7682]">Items</div>
              <div className="text-sm text-white">
                {formatItemSummary(items)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
