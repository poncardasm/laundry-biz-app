import { useState, useEffect } from 'react'
import { initDB } from './db'
import Sidebar from './components/Sidebar'
import BoardView from './views/BoardView'
import NewOrderView from './views/NewOrderView'
import SearchView from './views/SearchView'
import SettingsView from './views/SettingsView'

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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg-marketing)' }}>
        <div className="p-6 rounded-lg border" style={{ 
          background: 'var(--color-bg-surface)', 
          borderColor: 'var(--color-border-standard)',
          maxWidth: '400px'
        }}>
          <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Error
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-marketing)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" 
               style={{ borderColor: 'var(--color-brand-accent)', borderTopColor: 'transparent' }} />
          <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>Loading database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-marketing)' }}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 ml-64 p-6" style={{ background: 'var(--color-bg-panel)' }}>
        {currentView === 'board' && <BoardView />}
        {currentView === 'new-order' && <NewOrderView onViewChange={setCurrentView} />}
        {currentView === 'search' && <SearchView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}

export default App
