'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Textarea } from '../components/ui/Textarea'
import { addSideQuestFollowUp } from '../actions'
import { useRouter } from 'next/navigation'

export function SideQuestFollowUpForm({ sideQuestId }: { sideQuestId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [files, setFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Handle paste event
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData && e.clipboardData.files.length > 0) {
                const pastedFiles = Array.from(e.clipboardData.files)
                setFiles(prev => [...prev, ...pastedFiles].slice(0, 20))
            }
        }
        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles].slice(0, 20))
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const form = event.currentTarget
        const formData = new FormData(form)

        // Remove dummy attachment input
        formData.delete('attachments_dummy')

        // Append files
        files.forEach(file => {
            formData.append('attachments', file)
        })

        const res = await addSideQuestFollowUp(formData)

        if (res.error) {
            setError(res.error)
        } else if (res.success) {
            form.reset()
            setFiles([]) // Reset files
            router.refresh()
        }

        setLoading(false)
    }

    return (
        <>
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="sideQuestId" value={sideQuestId} />
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="action">Action / Update</Label>
                    <Textarea id="action" name="action" placeholder="What happened?" rows={3} required />
                </div>

                <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md relative hover:bg-muted/50 transition-colors border-input">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-8 w-8 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-xs text-muted-foreground justify-center">
                                <label htmlFor="followup-attachments" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                                    <span>Upload</span>
                                    <input id="followup-attachments" name="attachments_dummy" type="file" className="sr-only" multiple onChange={handleFileChange} ref={fileInputRef} />
                                </label>
                                <p className="pl-1">or drag & drop</p>
                            </div>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-2">
                            <ul className="divide-y divide-border border rounded-md">
                                {files.map((file, index) => (
                                    <li key={index} className="pl-3 pr-4 py-2 flex items-center justify-between text-xs">
                                        <div className="w-0 flex-1 flex items-center">
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <button type="button" onClick={() => removeFile(index)} className="font-medium text-destructive hover:text-destructive/90">
                                                ×
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Follow-up'}
                </Button>
            </form>
        </>
    )
}
