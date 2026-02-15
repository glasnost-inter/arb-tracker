'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { Label } from '../components/ui/Label'
import { Textarea } from '../components/ui/Textarea'
import RichTextEditor from '../components/ui/RichTextEditor'
import { ImageUploaderWithCaption } from '../components/ui/ImageUploaderWithCaption'
import { addSideQuestFollowUp } from '../actions'
import { useRouter } from 'next/navigation'

export function SideQuestFollowUpForm({ sideQuestId }: { sideQuestId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [files, setFiles] = useState<File[]>([])
    const [action, setAction] = useState('')
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
        files.forEach((file, index) => {
            formData.append('attachments', file)
            formData.append('attachment_captions', (file as any).caption || '')
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
                        <DatePicker id="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="action">Action / Update</Label>
                    <RichTextEditor
                        value={action}
                        onChange={setAction}
                        placeholder="What happened?"
                    />
                    <input type="hidden" name="action" value={action} />
                </div>

                <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="mt-1">
                        <ImageUploaderWithCaption
                            onUpload={async (file, caption) => {
                                const newFile = file as any
                                newFile.caption = caption
                                setFiles(prev => [...prev, newFile])
                            }}
                            triggerText="Paste image or click to upload"
                            className="w-full"
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="mt-2">
                            <ul className="divide-y divide-border border rounded-md">
                                {files.map((file, index) => (
                                    <li key={index} className="pl-3 pr-4 py-2 flex items-center justify-between text-xs">
                                        <div className="w-0 flex-1 flex items-center">
                                            <div className="flex flex-col">
                                                <span className="truncate font-medium">{file.name}</span>
                                                {(file as any).caption && <span className="text-xs text-muted-foreground italic truncate">"{(file as any).caption}"</span>}
                                            </div>
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
