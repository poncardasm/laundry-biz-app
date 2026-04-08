import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LayoutDashboardIcon, PlusCircleIcon, SearchIcon, SettingsIcon } from 'lucide-react'

interface SidebarProps {
  currentView: 'board' | 'new-order' | 'search' | 'settings'
  onViewChange: (view: 'board' | 'new-order' | 'search' | 'settings') => void
}

const navItems = [
  { id: 'board' as const, label: 'Board', icon: LayoutDashboardIcon },
  { id: 'new-order' as const, label: 'New Order', icon: PlusCircleIcon },
  { id: 'search' as const, label: 'Search', icon: SearchIcon },
  { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <ShadcnSidebar>
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-medium">Laundry Biz</h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentView === item.id}
                    onClick={() => onViewChange(item.id)}
                  >
                    <item.icon data-icon="inline-start" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="px-4 py-3 rounded-md bg-sidebar-accent">
          <p className="text-xs text-muted-foreground">Data stored locally</p>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
