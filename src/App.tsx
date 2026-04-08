import { useState, useEffect } from 'react'
import { initDB } from './db'
import Sidebar from './components/Sidebar'
import BoardView from './views/BoardView'
import NewOrderView from './views/NewOrderView'
import SearchView from './views/SearchView'
import SettingsView from './views/SettingsView'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

type View = 'board' | 'new-order' | 'search' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<View>('board')
  const [isDbReady, setIsDbReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initDB()
      .then(() => {
        setIsDbReady(true)
        console.log('Database initialized successfully')
      })
      .catch((err) => {
        console.error('Failed to initialize database:', err)
        setError('Failed to initialize database. Please refresh the page.')
      })
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <p className="text-muted-foreground text-sm">Loading database...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <SidebarInset className="bg-background">
          <div className="p-6">
            {currentView === 'board' && <BoardView />}
            {currentView === 'new-order' && <NewOrderView onViewChange={setCurrentView} />}
            {currentView === 'search' && <SearchView />}
            {currentView === 'settings' && <SettingsView />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default App
