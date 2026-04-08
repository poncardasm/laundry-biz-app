import { useState, useRef } from 'react'
import { exportDB, importDB, persistDB } from '../db'

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
        <h2 style={{ color: 'var(--color-text-primary)' }}>Settings</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Backup and restore your data
        </p>
      </div>

      {message && (
        <div 
          className="mb-6 px-4 py-3 rounded-md border"
          style={{
            background: message.type === 'success' ? 'rgba(39, 166, 68, 0.1)' : 'rgba(255, 100, 100, 0.1)',
            borderColor: message.type === 'success' ? 'rgba(39, 166, 68, 0.3)' : 'rgba(255, 100, 100, 0.3)',
            color: message.type === 'success' ? '#6fcf97' : '#ff9999'
          }}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div 
          className="p-6 rounded-lg border"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'var(--color-border-standard)'
          }}
        >
          <h3 
            className="text-base font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Storage Information
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Your data is stored locally in your browser using OPFS (Origin Private File System). 
            Data persists across page refreshes but is not stored in the repository.
          </p>
          <p 
            className="text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Auto-save interval: 3 seconds
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'var(--color-border-standard)'
          }}
        >
          <h3 
            className="text-base font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Manual Save
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Force save your data immediately instead of waiting for auto-save.
          </p>
          <button
            onClick={handleManualSave}
            className="px-4 py-2 rounded-md font-medium"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--color-text-secondary)'
            }}
          >
            Save Now
          </button>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'var(--color-border-standard)'
          }}
        >
          <h3 
            className="text-base font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Backup Database
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Export your database to a .db file for backup or transfer to another device.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-md font-medium flex items-center gap-2"
            style={{
              background: 'var(--color-brand-bg)',
              color: 'white',
              opacity: exporting ? 0.6 : 1
            }}
          >
            {exporting ? 'Exporting...' : 'Export Database'}
          </button>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'var(--color-border-standard)'
          }}
        >
          <h3 
            className="text-base font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Restore Database
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Import a previously exported .db file. 
            <strong style={{ color: 'var(--color-text-primary)' }}> Warning: This will replace all current data.</strong>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".db"
            onChange={handleImport}
            disabled={importing}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className="inline-block px-4 py-2 rounded-md font-medium cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--color-text-secondary)',
              opacity: importing ? 0.6 : 1
            }}
          >
            {importing ? 'Importing...' : 'Choose File'}
          </label>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{
            background: 'rgba(255, 100, 100, 0.05)',
            borderColor: 'rgba(255, 100, 100, 0.2)'
          }}
        >
          <h3 
            className="text-base font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Clear Data
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Clear all data by clearing site data in DevTools: Application → Storage → Clear site data
          </p>
        </div>
      </div>
    </div>
  )
}
