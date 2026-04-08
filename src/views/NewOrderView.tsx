import { useState, useEffect } from 'react'
import { getItems, createOrder } from '../db'
import type { Item } from '../db'

interface NewOrderViewProps {
  onViewChange: (view: 'board' | 'new-order' | 'search' | 'settings') => void
}

interface OrderItemRow {
  id: string
  itemId: number | null
  itemName: string
  quantity: number
  price: number
}

export default function NewOrderView({ onViewChange }: NewOrderViewProps) {
  const [items, setItems] = useState<Item[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [itemRows, setItemRows] = useState<OrderItemRow[]>([
    { id: '1', itemId: null, itemName: '', quantity: 1, price: 0 }
  ])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const lookupItems = getItems()
    setItems(lookupItems)
  }, [])

  const calculateTotal = () => {
    return itemRows.reduce((sum, row) => sum + (row.price * row.quantity), 0)
  }

  const addItemRow = () => {
    const newId = (Math.max(...itemRows.map(r => parseInt(r.id))) + 1).toString()
    setItemRows([...itemRows, { id: newId, itemId: null, itemName: '', quantity: 1, price: 0 }])
  }

  const removeItemRow = (id: string) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter(row => row.id !== id))
    }
  }

  const updateItemRow = (id: string, field: keyof OrderItemRow, value: any) => {
    setItemRows(itemRows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value }
        
        if (field === 'itemId' && value) {
          const selectedItem = items.find(item => item.id === value)
          if (selectedItem) {
            updated.itemName = selectedItem.name
            updated.price = selectedItem.price
          }
        }
        
        return updated
      }
      return row
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!customerName.trim()) {
      setError('Customer name is required')
      return
    }

    const validItems = itemRows.filter(row => row.itemId && row.quantity > 0)
    
    if (validItems.length === 0) {
      setError('At least one item is required')
      return
    }

    try {
      createOrder(
        customerName.trim(),
        customerPhone.trim() || null,
        notes.trim() || null,
        validItems.map(row => ({
          itemName: row.itemName,
          quantity: row.quantity,
          price: row.price
        }))
      )

      setCustomerName('')
      setCustomerPhone('')
      setNotes('')
      setItemRows([{ id: '1', itemId: null, itemName: '', quantity: 1, price: 0 }])
      
      onViewChange('board')
    } catch (err) {
      setError('Failed to create order')
      console.error(err)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 style={{ color: 'var(--color-text-primary)' }}>New Order</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Create a new laundry order
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div 
            className="mb-4 px-4 py-3 rounded-md border"
            style={{
              background: 'rgba(255, 100, 100, 0.1)',
              borderColor: 'rgba(255, 100, 100, 0.3)',
              color: '#ff9999'
            }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              rows={3}
              placeholder="Special instructions"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label 
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Items
            </label>
            <button
              type="button"
              onClick={addItemRow}
              className="px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-text-secondary)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add Item
            </button>
          </div>

          <div className="space-y-2">
            {itemRows.map((row) => (
              <div key={row.id} className="flex gap-2 items-center">
                <select
                  value={row.itemId || ''}
                  onChange={(e) => updateItemRow(row.id, 'itemId', e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1"
                >
                  <option value="">Select item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ${item.price}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => updateItemRow(row.id, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-20"
                  placeholder="Qty"
                />

                <div 
                  className="w-24 px-3 py-2 rounded-md text-right"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    color: 'var(--color-text-tertiary)'
                  }}
                >
                  ${(row.price * row.quantity).toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={() => removeItemRow(row.id)}
                  className="p-2 rounded-md hover:bg-white hover:bg-opacity-10"
                  disabled={itemRows.length === 1}
                  style={{ opacity: itemRows.length === 1 ? 0.3 : 1 }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="flex items-center justify-between p-4 rounded-lg border mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'var(--color-border-standard)'
          }}
        >
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total</span>
          <span className="text-xl font-medium" style={{ color: 'var(--color-brand-accent)' }}>
            ${calculateTotal().toFixed(2)}
          </span>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 rounded-md font-medium text-white"
          style={{
            background: 'var(--color-brand-bg)'
          }}
        >
          Create Order
        </button>
      </form>
    </div>
  )
}
