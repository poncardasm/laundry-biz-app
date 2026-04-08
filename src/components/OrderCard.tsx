import type { Order } from '../db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface OrderCardProps {
  order: Order
  onMoveForward?: () => void
  onMoveBack?: () => void
}

export default function OrderCard({ order, onMoveForward, onMoveBack }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="cursor-pointer hover:border-primary/20 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <Badge variant="secondary">#{order.id}</Badge>
          <div className="flex gap-1">
            {onMoveBack && (
              <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onMoveBack() }}>
                <ChevronLeftIcon data-icon="inline-start" />
              </Button>
            )}
            {onMoveForward && (
              <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onMoveForward() }}>
                <ChevronRightIcon data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardTitle className="text-sm mb-1">{order.customer_name}</CardTitle>
        {order.customer_phone && (
          <p className="text-xs text-muted-foreground mb-2">{order.customer_phone}</p>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-sm font-medium text-primary">${order.total.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
