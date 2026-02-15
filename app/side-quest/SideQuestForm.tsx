'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { Select } from '../components/ui/Select'
import { Label } from '../components/ui/Label'
import { Textarea } from '../components/ui/Textarea'
import RichTextEditor from '../components/ui/RichTextEditor'
import { ImageUploaderWithCaption } from '../components/ui/ImageUploaderWithCaption'
import { submitSideQuest } from '../actions'
import { useRouter } from 'next/navigation'

export function SideQuestForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [successCode, setSuccessCode] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [files, setFiles] = useState<File[]>([])
    const [instruction, setInstruction] = useState('')
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
        setSuccessCode(null)

        const form = event.currentTarget
        const formData = new FormData(form)

        // Remove dummy attachment input
        formData.delete('attachments_dummy')

        // Append files
        files.forEach((file, index) => {
            formData.append('attachments', file)
            formData.append('attachment_captions', (file as any).caption || '')
        })

        const res = await submitSideQuest(formData)

        if (res.error) {
            setError(res.error)
        } else if (res.success && res.ticketCode) {
            setSuccessCode(res.ticketCode)
            // Reset form
            form.reset()
            setFiles([]) // Clear files after successful submission

            // Redirect to detail page if ID is available
            if (res.id) {
                router.push(`/side-quest/${res.id}`)
            } else {
                router.refresh()
            }
        }

        setLoading(false)
    }

    return (
        <Card className="w-full max-w-lg mb-8">
            <CardHeader>
                <CardTitle>New Side Quest</CardTitle>
                <CardDescription>Create a local task ticket.</CardDescription>
            </CardHeader>
            <CardContent>
                {successCode && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                        <p className="font-semibold">Success!</p>
                        <p>Ticket created: <strong>{successCode}</strong></p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                        <p className="font-semibold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="questName">Quest Name</Label>
                        <Input
                            type="text"
                            id="questName"
                            name="questName"
                            placeholder="Brief title for this quest"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instruction">Instruction</Label>
                        <RichTextEditor
                            value={instruction}
                            onChange={setInstruction}
                            placeholder="What needs to be done?"
                        />
                        <input type="hidden" name="instruction" value={instruction} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="requestDate">Request Date</Label>
                            <DatePicker
                                id="requestDate"
                                name="requestDate"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <DatePicker
                                id="dueDate"
                                name="dueDate"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="finishDate">Finish Date</Label>
                            <DatePicker
                                id="finishDate"
                                name="finishDate"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="requestor">Requestor</Label>
                            <Input
                                type="text"
                                id="requestor"
                                name="requestor"
                                placeholder="Who asked for this?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="executor">Executor</Label>
                            <Input
                                type="text"
                                id="executor"
                                name="executor"
                                placeholder="Who will do this?"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="impactScore">Impact Score (1-5)</Label>
                        <Select id="impactScore" name="impactScore" required>
                            <option value="1">1 - Low</option>
                            <option value="2">2 - Minor</option>
                            <option value="3">3 - Moderate</option>
                            <option value="4">4 - High (Strategic)</option>
                            <option value="5">5 - Critical (Strategic)</option>
                        </Select>
                        <p className="text-xs text-muted-foreground">Score 4+ marks as Strategic</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select id="status" name="status" defaultValue="Submited">
                            <option value="Submited">Submited</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                            <option value="Waiting Confirmation">Waiting Confirmation</option>
                        </Select>
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
                        {loading ? 'Creating Ticket...' : 'Create Side Quest'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
