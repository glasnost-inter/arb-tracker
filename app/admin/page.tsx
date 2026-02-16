'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import { Container } from '@/app/components/ui/Container'
import { manualBackup, getBackupFiles, restoreBackup } from '@/app/actions'
import { Loader2, Database, History, Download, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react'

interface BackupFile {
    name: string
    size: number
    createdAt: Date
}

export default function AdminPage() {
    const [backups, setBackups] = useState<BackupFile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isBackingUp, setIsBackingUp] = useState(false)
    const [isRestoring, setIsRestoring] = useState<string | null>(null)

    const fetchBackups = async () => {
        setIsLoading(true)
        const files = await getBackupFiles()
        setBackups(files)
        setIsLoading(false)
    }

    useEffect(() => {
        fetchBackups()
    }, [])

    const handleBackup = async () => {
        setIsBackingUp(true)
        const result = await manualBackup()
        if (result.success) {
            alert('Backup successful!')
            fetchBackups()
        } else {
            alert(`Backup failed: ${result.error}`)
        }
        setIsBackingUp(false)
    }

    const handleRestore = async (filename: string) => {
        if (!confirm(`WARNING: Are you sure you want to restore "${filename}"? This will overwrite the current database data and cannot be undone.`)) {
            return
        }

        setIsRestoring(filename)
        const result = await restoreBackup(filename)
        if (result.success) {
            alert('Database restored successfully!')
            window.location.reload()
        } else {
            alert(`Restore failed: ${result.error}`)
        }
        setIsRestoring(null)
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Container className="py-10 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#0052D4] to-[#4364F7] bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage database backups and disaster recovery protocols.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Backup Hero Card */}
                <Card className="md:col-span-1 border-none bg-gradient-to-br from-[#0052D4] to-[#4364F7] text-white shadow-2xl overflow-hidden relative">
                    <div className="absolute top-[-20px] right-[-20px] opacity-10">
                        <Database size={200} />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6" />
                            System Protection
                        </CardTitle>
                        <CardDescription className="text-blue-100/80">
                            Perform manual snapshots of the production database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="p-4 bg-white/15 rounded-xl backdrop-blur-md border border-white/20">
                            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Last Sync Check</div>
                            <div className="text-xl font-mono text-white">
                                {backups.length > 0 ? formatDate(backups[0].createdAt) : 'Never'}
                            </div>
                        </div>
                        <Button
                            className="w-full h-14 bg-white text-[#0052D4] hover:bg-slate-50 font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                            onClick={handleBackup}
                            disabled={isBackingUp}
                        >
                            {isBackingUp ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating Snapshot...
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="mr-2 h-5 w-5" />
                                    Backup Now
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Snapshots List */}
                <Card className="md:col-span-2 border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
                    <CardHeader className="border-b border-border/50 bg-muted/30">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-muted-foreground" />
                                    Recovery Snapshots
                                </CardTitle>
                                <CardDescription>
                                    Available database restoration points.
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="px-3 py-1">
                                {backups.length} Files
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                <p className="text-muted-foreground animate-pulse">Scanning backup directory...</p>
                            </div>
                        ) : backups.length === 0 ? (
                            <div className="text-center py-20">
                                <Database className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground">No backup files found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50 overflow-hidden rounded-b-xl">
                                {backups.map((file) => (
                                    <div key={file.name} className="flex flex-col sm:flex-row items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                <Database className="h-5 w-5 text-[#0052D4]" />
                                            </div>
                                            <div>
                                                <div className="font-bold font-mono text-sm">{file.name}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-muted-foreground">{formatDate(file.createdAt)}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded uppercase font-bold text-muted-foreground tracking-tighter tabular-nums text-center min-w-[50px]">
                                                        {formatSize(file.size)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                                                disabled={isRestoring !== null}
                                                onClick={() => handleRestore(file.name)}
                                            >
                                                {isRestoring === file.name ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                ) : (
                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                )}
                                                Restore
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Disaster Recovery Warning */}
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row gap-6 items-start">
                <div className="p-3 bg-amber-100 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-amber-900">Disaster Recovery Protocol</h3>
                    <p className="text-amber-800/80 mt-1 max-w-2xl">
                        Restore operations involve destructive changes to the current database state.
                        Always verify the integrity of the selected snapshot before proceeding.
                        Automated backups run every 6 hours and are retained for 7 days.
                    </p>
                </div>
            </div>
        </Container>
    )
}
