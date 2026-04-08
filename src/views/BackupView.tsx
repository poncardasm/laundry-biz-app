import { useState, useRef, useCallback } from "react"
import { exportDB, importDB, persistDB } from "@/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Database,
} from "lucide-react"

export function BackupView() {
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle")
  const [importMessage, setImportMessage] = useState("")
  const [exportSuccess, setExportSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = useCallback(() => {
    try {
      const blob = exportDB()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0]
      link.download = `laundry-backup-${date}.db`
      link.href = url

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (err) {
      console.error("Export error:", err)
      setImportStatus("error")
      setImportMessage("Failed to export database")
    }
  }, [])

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Reset status
      setImportStatus("idle")
      setImportMessage("")

      // Validate file extension
      if (!file.name.endsWith(".db")) {
        setImportStatus("error")
        setImportMessage("Please select a valid .db file")
        return
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        await importDB(arrayBuffer)

        setImportStatus("success")
        setImportMessage(
          "Database imported successfully! All data has been restored."
        )

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } catch (err) {
        console.error("Import error:", err)
        setImportStatus("error")
        setImportMessage(
          err instanceof Error ? err.message : "Failed to import database"
        )
      }
    },
    []
  )

  const handleForceSave = async () => {
    try {
      await persistDB()
      setImportStatus("success")
      setImportMessage("Database saved successfully!")
      setTimeout(() => setImportStatus("idle"), 3000)
    } catch (err) {
      setImportStatus("error")
      setImportMessage("Failed to save database")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">
          Backup & Restore
        </h1>
        <p className="text-sm text-muted-foreground">
          Export and import your data
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Import Status Alerts */}
          {importStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {importMessage}
              </AlertDescription>
            </Alert>
          )}

          {importStatus === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {importMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Export Section */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Download className="h-5 w-5 text-primary" />
                Export Database
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Download a backup of your entire database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will create a .db file containing all your orders,
                customers, and settings. Keep this file safe as your backup.
              </p>

              <Button
                onClick={handleExport}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export to File
              </Button>

              {exportSuccess && (
                <p className="text-sm text-green-600">
                  Export successful! File downloaded.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Upload className="h-5 w-5 text-primary" />
                Restore Database
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Import a previously exported .db file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Warning: Importing will replace all current data with the
                  backup data. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <p className="text-sm text-muted-foreground">
                Select a .db file that was previously exported from this app.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".db"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                onClick={handleImportClick}
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Backup File
              </Button>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Database className="h-5 w-5 text-primary" />
                Storage Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your data is stored locally in your browser using the Origin
                Private File System (OPFS). This means:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Data persists across browser restarts</li>
                <li>No internet connection required</li>
                <li>Data is not synced to any cloud service</li>
                <li>
                  Data is only accessible from this browser on this device
                </li>
              </ul>
              <p className="mt-4">
                To prevent data loss, we recommend exporting a backup regularly.
              </p>

              <Button
                onClick={handleForceSave}
                variant="outline"
                size="sm"
                className="mt-2 border-border text-muted-foreground hover:bg-muted"
              >
                Force Save Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
