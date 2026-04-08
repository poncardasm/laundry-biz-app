import { useState, useEffect, useCallback } from "react"
import type { ItemLookup, Item } from "@/db"
import { createOrder, getItems, getItemPrice, formatPrice } from "@/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, CheckCircle } from "lucide-react"

interface NewOrderViewProps {
  onOrderCreated: () => void
}

interface ItemRow {
  id: string
  name: string
  quantity: number
  unit_price: number
}

export function NewOrderView({ onOrderCreated }: NewOrderViewProps) {
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [items, setItems] = useState<ItemLookup[]>([])
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { id: crypto.randomUUID(), name: "", quantity: 1, unit_price: 0 },
  ])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load available items
  useEffect(() => {
    const loadItems = () => {
      try {
        const loadedItems = getItems()
        setItems(loadedItems)
      } catch (err) {
        console.error("Error loading items:", err)
      }
    }
    loadItems()
  }, [])

  const calculateTotal = useCallback(() => {
    return itemRows.reduce((sum, row) => sum + row.unit_price * row.quantity, 0)
  }, [itemRows])

  const handleAddItemRow = () => {
    setItemRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", quantity: 1, unit_price: 0 },
    ])
  }

  const handleRemoveItemRow = (id: string) => {
    setItemRows((prev) => prev.filter((row) => row.id !== id))
  }

  const handleItemChange = (rowId: string, itemName: string) => {
    const price = getItemPrice(itemName) || 0
    setItemRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, name: itemName, unit_price: price } : row
      )
    )
  }

  const handleQuantityChange = (rowId: string, quantity: number) => {
    setItemRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, quantity: Math.max(1, quantity) } : row
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!customerName.trim()) {
      setError("Customer name is required")
      return
    }

    // Filter out empty item rows
    const validItems = itemRows.filter((row) => row.name.trim() !== "")

    if (validItems.length === 0) {
      setError("Please add at least one item")
      return
    }

    // Convert to Item format
    const orderItems: Item[] = validItems.map((row) => ({
      name: row.name,
      quantity: row.quantity,
      unit_price: row.unit_price,
    }))

    setIsLoading(true)

    try {
      createOrder(customerName.trim(), phone.trim(), orderItems)
      setSuccess(true)

      // Reset form
      setCustomerName("")
      setPhone("")
      setItemRows([
        { id: crypto.randomUUID(), name: "", quantity: 1, unit_price: 0 },
      ])

      // Redirect after short delay
      setTimeout(() => {
        onOrderCreated()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order")
    } finally {
      setIsLoading(false)
    }
  }

  const total = calculateTotal()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">New Order</h1>
        <p className="text-sm text-muted-foreground">
          Create a new laundry order
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl">
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Order created successfully!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="customerName"
                    className="text-card-foreground"
                  >
                    Customer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-card-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number (optional)"
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">Items</CardTitle>
                <Button
                  type="button"
                  onClick={handleAddItemRow}
                  variant="outline"
                  size="sm"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {itemRows.map((row) => (
                  <div key={row.id} className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Item
                      </Label>
                      <Select
                        value={row.name}
                        onValueChange={(value) =>
                          handleItemChange(row.id, value)
                        }
                      >
                        <SelectTrigger className="border-input bg-background text-foreground">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-popover">
                          {items.map((item) => (
                            <SelectItem
                              key={item.name}
                              value={item.name}
                              className="text-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              {item.name} ({formatPrice(item.unit_price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24 space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Qty
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            row.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="border-input bg-background text-foreground"
                      />
                    </div>

                    <div className="w-24 space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Price
                      </Label>
                      <div className="flex h-9 items-center text-sm text-foreground">
                        {formatPrice(row.unit_price * row.quantity)}
                      </div>
                    </div>

                    {itemRows.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveItemRow(row.id)}
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(total)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
