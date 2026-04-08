import type { Order } from '../db'

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
    <div 
      className="p-4 rounded-lg border cursor-pointer hover:border-opacity-20 transition-all"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'var(--color-border-standard)'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span 
          className="text-xs font-medium px-2 py-1 rounded"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--color-text-tertiary)'
          }}
        >
          #{order.id}
        </span>
        <div className="flex gap-1">
          {onMoveBack && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveBack()
              }}
              className="p-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors"
              title="Move back"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          {onMoveForward && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveForward()
              }}
              className="p-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors"
              title="Move forward"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <h3 
        className="text-sm font-medium mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {order.customer_name}
      </h3>

      {order.customer_phone && (
        <p 
          className="text-xs mb-2"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {order.customer_phone}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <span 
          className="text-sm font-medium"
          style={{ color: 'var(--color-brand-accent)' }}
        >
          ${order.total.toFixed(2)}
        </span>
        <span 
          className="text-xs"
          style={{ color: 'var(--color-text-quaternary)' }}
        >
          {formatDate(order.created_at)}
        </span>
      </div>
    </div>
  )
}
