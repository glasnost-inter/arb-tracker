'use client'

import { useState } from 'react'
import { updateFollowupTask } from '../actions'
import { Attachment } from '@prisma/client'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Input } from './ui/Input'
import { Label } from './ui/Label'

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
    const [isUploading, setIsUploading] = useState(false)
    const [files, setFiles] = useState<FileList | null>(null)

    const toggleComplete = async () => {
        const newState = !isCompleted
        setIsCompleted(newState) // Optimistic update

        const formData = new FormData()
        formData.append('isCompleted', String(newState))

        await updateFollowupTask(task.id, formData)
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!files || files.length === 0) return

        setIsUploading(true)
        const formData = new FormData()
        // Maintain current completion status
        formData.append('isCompleted', String(isCompleted))

        for (let i = 0; i < files.length; i++) {
            formData.append('attachments', files[i])
        }

        await updateFollowupTask(task.id, formData)

        setIsUploading(false)
        setFiles(null)
        // Reset file input value
        // Note: For full UX we might want to refresh the list of attachments here
        // but server action revalidates path, so page should reload/refresh.
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

                    {/* Upload Section */}
                    <div className="mt-3 pt-2 border-t border-border/50">
                        <label className="text-xs font-medium mb-1 block">Add Evidence</label>
                        <form onSubmit={handleUpload} className="flex gap-2 items-center">
                            <Input
                                type="file"
                                multiple
                                className="h-8 text-xs py-1"
                                onChange={(e) => setFiles(e.target.files)}
                            />
                            <Button size="sm" type="submit" disabled={!files || isUploading} variant="secondary" className="h-8 text-xs">
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </li>
    )
}
