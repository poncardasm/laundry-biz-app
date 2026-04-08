import { useState, useRef } from 'react'
import { exportDB, importDB, persistDB } from '../db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DownloadIcon, UploadIcon, SaveIcon } from 'lucide-react'

export default function SettingsView() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setExporting(true)
    setMessage(null)

    try {
      const data = exportDB()
      
      if (!data) {
        throw new Error('No database to export')
      }

      const blob = new Blob([new Uint8Array(data).buffer], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      a.href = url
      a.download = `laundry-biz-backup-${timestamp}.db`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: 'Database exported successfully' })
    } catch (error) {
      console.error('Export error:', error)
      setMessage({ type: 'error', text: 'Failed to export database' })
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (!file) {
      return
    }

    if (!file.name.endsWith('.db')) {
      setMessage({ type: 'error', text: 'Invalid file type. Please select a .db file' })
      return
    }

    setImporting(true)
    setMessage(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      await importDB(uint8Array)
      
      setMessage({ type: 'success', text: 'Database imported successfully. Refresh the page to see changes.' })
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Import error:', error)
      setMessage({ type: 'error', text: 'Failed to import database. Make sure the file is valid.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleManualSave = async () => {
    try {
      await persistDB()
      setMessage({ type: 'success', text: 'Database saved successfully' })
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Failed to save database' })
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Backup and restore your data</p>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Information</CardTitle>
            <CardDescription>
              Your data is stored locally in your browser using OPFS (Origin Private File System). 
              Data persists across page refreshes but is not stored in the repository.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Auto-save interval: 3 seconds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Save</CardTitle>
            <CardDescription>
              Force save your data immediately instead of waiting for auto-save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleManualSave}>
              <SaveIcon data-icon="inline-start" />
              Save Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup Database</CardTitle>
            <CardDescription>
              Export your database to a .db file for backup or transfer to another device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} disabled={exporting}>
              <DownloadIcon data-icon="inline-start" />
              {exporting ? 'Exporting...' : 'Export Database'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restore Database</CardTitle>
            <CardDescription>
              Import a previously exported .db file. 
              <span className="text-destructive font-medium"> Warning: This will replace all current data.</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".db"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
              id="import-file"
            />
            <Button variant="outline" asChild>
              <label htmlFor="import-file" className="cursor-pointer">
                <UploadIcon data-icon="inline-start" />
                {importing ? 'Importing...' : 'Choose File'}
              </label>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Clear Data</CardTitle>
            <CardDescription>
              Clear all data by clearing site data in DevTools: Application → Storage → Clear site data
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
