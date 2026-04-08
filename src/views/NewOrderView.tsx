import { useState, useEffect } from 'react'
import { getItems, createOrder } from '../db'
import type { Item } from '../db'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PlusIcon, XIcon } from 'lucide-react'

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

  const updateItemRow = (id: string, field: keyof OrderItemRow, value: string | number | null) => {
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
        <h2 className="text-2xl font-semibold">New Order</h2>
        <p className="mt-1 text-sm text-muted-foreground">Create a new laundry order</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="customer-name">Customer Name *</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="customer-phone">Phone Number</Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions"
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                <PlusIcon data-icon="inline-start" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {itemRows.map((row) => (
                <div key={row.id} className="flex gap-2 items-center">
                  <Select
                    value={row.itemId?.toString() || ''}
                    onValueChange={(value) => updateItemRow(row.id, 'itemId', value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} - ${item.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateItemRow(row.id, 'quantity', parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-20"
                    placeholder="Qty"
                  />

                  <div className="w-24 px-3 py-2 rounded-md text-right bg-muted text-muted-foreground">
                    ${(row.price * row.quantity).toFixed(2)}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItemRow(row.id)}
                    disabled={itemRows.length === 1}
                  >
                    <XIcon data-icon="inline-start" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-medium text-primary">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </CardFooter>
        </Card>

        <Button type="submit" className="w-full">
          Create Order
        </Button>
      </form>
    </div>
  )
}
