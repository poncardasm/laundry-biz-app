import { LayoutGrid, Plus, Search, Download } from "lucide-react"
import { cn } from "@/lib/utils"

type View = "board" | "new-order" | "search" | "backup"

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

const navItems: { id: View; label: string; icon: typeof LayoutGrid }[] = [
  { id: "board", label: "Orders Board", icon: LayoutGrid },
  { id: "new-order", label: "New Order", icon: Plus },
  { id: "search", label: "Search", icon: Search },
  { id: "backup", label: "Backup & Restore", icon: Download },
]

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="flex w-60 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">L</span>
        </div>
        <span className="font-semibold text-sidebar-foreground">
          Laundry Biz
        </span>
      </div>

      <nav className="flex-1 p-2">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium text-sidebar-foreground">Storage</div>
          <div className="mt-1">Data is saved locally in your browser.</div>
        </div>
      </div>
    </aside>
  )
}
