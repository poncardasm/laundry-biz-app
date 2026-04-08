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
    <aside className="flex w-60 flex-col border-r border-[#272a30] bg-[#0f1115]">
      <div className="flex items-center gap-2 border-b border-[#272a30] px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5e6ad2]">
          <span className="text-sm font-bold text-white">L</span>
        </div>
        <span className="font-semibold text-white">Laundry Biz</span>
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
                    ? "bg-[#5e6ad2]/10 text-[#5e6ad2]"
                    : "text-[#6f7682] hover:bg-[#161922] hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-[#272a30] p-4">
        <div className="text-xs text-[#6f7682]">
          <div className="font-medium text-white">Storage</div>
          <div className="mt-1">Data is saved locally in your browser.</div>
        </div>
      </div>
    </aside>
  )
}
