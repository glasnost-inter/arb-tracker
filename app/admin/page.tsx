'use client'

import { useState } from 'react'
import { Container } from '../components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import Link from 'next/link'

export default function AdminPage() {
    const [restoreFile, setRestoreFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleDownloadBackup = async () => {
        try {
            const response = await fetch('/api/backup')
            if (!response.ok) throw new Error('Failed to download backup')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `backup-${new Date().toISOString().split('T')[0]}.db`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Download error:', error)
            setMessage({ type: 'error', text: 'Failed to download backup' })
        }
    }

    const handleRestoreBackup = async () => {
        if (!restoreFile) return

        if (!confirm('WARNING: This will overwrite the current database with the backup file. Are you sure you want to proceed?')) {
            return
        }

        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.append('file', restoreFile)

        try {
            const response = await fetch('/api/restore', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Restore failed')
            }

            setMessage({ type: 'success', text: 'Database restored successfully! Please refresh the page.' })
            setRestoreFile(null)
        } catch (error) {
            console.error('Restore error:', error)
            setMessage({ type: 'error', text: 'Failed to restore database.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background py-10">
            <Container>
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary mb-4">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Settings</h1>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Database Backup</CardTitle>
                            <CardDescription>Download a copy of the current database (dev.db).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleDownloadBackup}>
                                Download Backup
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Restore Database</CardTitle>
                            <CardDescription className="text-destructive">
                                Warning: This will overwrite the current database. A backup of the current state will be saved as .bak before overwriting.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept=".db"
                                    onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                                />
                                <Button
                                    onClick={handleRestoreBackup}
                                    disabled={!restoreFile || loading}
                                    variant="destructive"
                                >
                                    {loading ? 'Restoring...' : 'Restore Backup'}
                                </Button>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {message.text}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    )
}
