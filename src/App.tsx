import { useState, useEffect, useCallback } from "react"
import { initDB, startAutoSave, setupEmergencySave } from "./db"
import { Sidebar } from "./components/Sidebar"
import { BoardView } from "./views/BoardView"
import { NewOrderView } from "./views/NewOrderView"
import { SearchView } from "./views/SearchView"
import { BackupView } from "./views/BackupView"

type View = "board" | "new-order" | "search" | "backup"

function App() {
  const [currentView, setCurrentView] = useState<View>("board")
  const [dbReady, setDbReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize database on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDB()
        setDbReady(true)
        startAutoSave()
        setupEmergencySave()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize database"
        )
        console.error("Database initialization error:", err)
      }
    }

    init()
  }, [])

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view)
  }, [])

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case "board":
        return <BoardView />
      case "new-order":
        return <NewOrderView onOrderCreated={() => setCurrentView("board")} />
      case "search":
        return <SearchView />
      case "backup":
        return <BackupView />
      default:
        return <BoardView />
    }
  }

  // Loading state
  if (!dbReady && !error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-2xl font-semibold text-foreground">
            Laundry Biz App
          </div>
          <div className="text-muted-foreground">Initializing database...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-2xl font-semibold text-red-500">Error</div>
          <div className="text-muted-foreground">{error}</div>
          <div className="mt-4 text-sm text-muted-foreground">
            Please make sure you're using Chrome or Edge with OPFS support.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <main className="flex-1 overflow-hidden">{renderView()}</main>
    </div>
  )
}

export default App
