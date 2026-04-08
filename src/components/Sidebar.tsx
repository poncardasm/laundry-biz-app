import type { ReactNode } from 'react'

interface SidebarProps {
  currentView: 'board' | 'new-order' | 'search' | 'settings'
  onViewChange: (view: 'board' | 'new-order' | 'search' | 'settings') => void
}

interface NavItem {
  id: 'board' | 'new-order' | 'search' | 'settings'
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  {
    id: 'board',
    label: 'Board',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="6" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="2" width="6" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="14" width="6" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: 'new-order',
    label: 'New Order',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6V14M6 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'search',
    label: 'Search',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 18L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.66 4.34L14.24 5.76M5.76 14.24L4.34 15.66M15.66 15.66L14.24 14.24M5.76 5.76L4.34 4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
]

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside 
      className="fixed left-0 top-0 h-full w-64 flex flex-col border-r"
      style={{
        background: 'var(--color-bg-panel)',
        borderColor: 'var(--color-border-subtle)'
      }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h1 className="text-xl font-medium" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.24px' }}>
          Laundry Biz
        </h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-150"
                style={{
                  background: currentView === item.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  color: currentView === item.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                }}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div 
          className="px-4 py-3 rounded-md"
          style={{ background: 'rgba(255, 255, 255, 0.02)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Data stored locally
          </p>
        </div>
      </div>
    </aside>
  )
}
