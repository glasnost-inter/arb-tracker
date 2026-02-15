'use client'

import { useState } from 'react'
import { updateFollowupTask } from '../actions'
import { Attachment } from '@prisma/client'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { ImageUploaderWithCaption } from './ui/ImageUploaderWithCaption'
import RichTextEditor from './ui/RichTextEditor'

type FollowupTaskWithAttachments = {
    id: string
    description: string
    isCompleted: boolean
    dueDate: Date
    attachments: { id: string, filename: string, path: string }[]
}

export default function FollowupTaskList({ tasks }: { tasks: FollowupTaskWithAttachments[] }) {
    return (
        <ul className="space-y-4">
            {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
            ))}
        </ul>
    )
}

function TaskItem({ task }: { task: FollowupTaskWithAttachments }) {
    const [isCompleted, setIsCompleted] = useState(task.isCompleted)
    const [action, setAction] = useState((task as any).action || '')
    const [isUploading, setIsUploading] = useState(false)
    const [pendingFiles, setPendingFiles] = useState<{ file: File, caption: string }[]>([])

    const toggleComplete = async () => {
        const newState = !isCompleted
        setIsCompleted(newState) // Optimistic update

        const formData = new FormData()
        formData.append('isCompleted', String(newState))
        formData.append('action', action)

        await updateFollowupTask(task.id, formData)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUploading(true)
        const formData = new FormData()
        formData.append('isCompleted', String(isCompleted))
        formData.append('action', action)

        pendingFiles.forEach(pf => {
            formData.append('attachments', pf.file)
            formData.append('attachment_captions', pf.caption)
        })

        await updateFollowupTask(task.id, formData)

        setIsUploading(false)
        setPendingFiles([])
    }

    return (
        <li className="p-3 border rounded-md bg-muted/40 transition-colors">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 cursor-pointer" onClick={toggleComplete}>
                    {isCompleted ? (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors"></div>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <div>
                        <p className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Attachments List */}
                    {task.attachments && task.attachments.length > 0 && (
                        <div className="mt-2 text-xs">
                            <p className="font-semibold text-muted-foreground mb-1">Evidence:</p>
                            <ul className="space-y-1">
                                {task.attachments.map(att => (
                                    <li key={att.id}>
                                        <a href={att.path} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            {att.filename}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor={`task-action-${task.id}`} className="text-xs text-muted-foreground">Action / Completion Notes</Label>
                        <RichTextEditor
                            value={action}
                            onChange={(val) => setAction(val)}
                            placeholder="Describe what has been done..."
                            className="min-h-[100px] text-xs"
                        />
                    </div>

                    {/* Upload Section */}
                    <div className="mt-3 pt-2 border-t border-border/50">
                        <label className="text-xs font-medium mb-1 block">Add Evidence / Save Action</label>

                        <div className="space-y-2">
                            <ImageUploaderWithCaption
                                onUpload={async (file, caption) => {
                                    setPendingFiles(prev => [...prev, { file, caption }])
                                }}
                                triggerText="Paste image or click to upload evidence"
                                className="w-full"
                            />

                            {pendingFiles.length > 0 && (
                                <ul className="text-[10px] space-y-1 bg-background/50 p-2 rounded border border-dashed text-muted-foreground">
                                    {pendingFiles.map((pf, idx) => (
                                        <li key={idx} className="flex justify-between items-center">
                                            <span className="truncate max-w-[150px]">{pf.file.name} {pf.caption && `(${pf.caption})`}</span>
                                            <button
                                                type="button"
                                                onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="text-destructive hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <Button
                                size="sm"
                                onClick={handleUpdate}
                                disabled={isUploading || (pendingFiles.length === 0 && action === (task as any).action)}
                                variant="secondary"
                                className="w-full h-8 text-xs font-semibold"
                            >
                                {isUploading ? 'Saving...' : 'Save Changes & Evidence'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
}
