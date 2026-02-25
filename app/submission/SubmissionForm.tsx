'use client'

import { useState, useEffect, useRef } from 'react'
import { submitProject, updateProject, updateFollowupTask } from '../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { ImageUploaderWithCaption } from '../components/ui/ImageUploaderWithCaption'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
// import { Textarea } from '../components/ui/Textarea' // Removed
import { Button } from '../components/ui/Button'
import RichTextEditor from '../components/ui/RichTextEditor'
import { AutoSuggest } from './AutoSuggest'

type Squad = {
    id: number
    name: string
}

type Attachment = {
    id: string
    filename: string
    path: string
}

type FollowupTask = {
    id?: string
    description: string
    action?: string
    isCompleted: boolean
    dueDate: string // stored as YYYY-MM-DD string for input
    attachments?: File[] // New files added in the form
    existingAttachments?: { id: string, filename: string, path: string }[]
}

type ProjectData = {
    id?: string
    name: string
    description: string | null
    ownerSquad: string
    pic: string
    type: string
    // docLink: string | null // Legacy
    docLinks?: { id: string, url: string }[]
    submissionDate: Date
    reviewDate: Date | null
    decisionDate: Date | null
    status: string
    decision: string | null
    mitigationNotes: string | null
    slaDuration: number
    attachments?: Attachment[]
    followupTasks?: { id: string, description: string, action?: string | null, isCompleted: boolean, dueDate: Date }[]
}

function TaskItem({
    task,
    index,
    updateTask,
    removeTask
}: {
    task: FollowupTask,
    index: number,
    updateTask: (index: number, field: keyof FollowupTask, value: any) => void,
    removeTask: (index: number) => void
}) {
    const [isSaving, setIsSaving] = useState(false)

    const handleSaveTask = async () => {
        if (!task.id) return
        setIsSaving(true)
        const formData = new FormData()
        formData.append('isCompleted', String(task.isCompleted))
        formData.append('action', task.action || '')

        if (task.attachments) {
            task.attachments.forEach(file => {
                formData.append('attachments', file)
                formData.append('attachment_captions', (file as any).caption || '')
            })
        }

        const res = await updateFollowupTask(task.id, formData)
        if (res.success) {
            // Clear pending attachments since they are now saved
            updateTask(index, 'attachments', [])
            // We'd ideally refresh existingAttachments here, but that requires a fresh fetch.
        }
        setIsSaving(false)
    }

    return (
        <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-lg border border-border/50 relative group transition-all hover:bg-muted/40">
            {/* Checklist Toggle */}
            <div
                className="mt-1 cursor-pointer flex-shrink-0"
                onClick={() => updateTask(index, 'isCompleted', !task.isCompleted)}
            >
                {task.isCompleted ? (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors bg-background"></div>
                )}
                <input type="hidden" name={`tasks[${index}].isCompleted`} value={String(task.isCompleted)} />
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex gap-2 items-center">
                    <div className="flex-1">
                        <Input
                            name={`tasks[${index}].description`}
                            placeholder="What needs to be done?"
                            value={task.description}
                            onChange={(e) => updateTask(index, 'description', e.target.value)}
                            required
                            className="bg-background border-none text-sm font-semibold p-0 h-auto focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 block">Action / Completion Notes</Label>
                    <RichTextEditor
                        value={(task as any).action || ''}
                        onChange={(val) => updateTask(index, 'action' as any, val)}
                        placeholder="Detail what was done for this task..."
                        className="min-h-[120px] bg-background border border-border/50 rounded-lg"
                    />
                    <input type="hidden" name={`tasks[${index}].action`} value={(task as any).action || ''} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-start">
                    <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 block">Due Date</Label>
                        <DatePicker
                            id={`task-date-${index}`}
                            name={`tasks[${index}].dueDate`}
                            value={task.dueDate}
                            onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 block">Evidence / Attachments</Label>
                        <ImageUploaderWithCaption
                            onUpload={async (file, caption) => {
                                const newFile = file as any
                                newFile.caption = caption
                                const currentTaskFiles = task.attachments || []
                                updateTask(index, 'attachments', [...currentTaskFiles, newFile])
                            }}
                            triggerText="Paste/Upload Evidence"
                        />
                    </div>
                </div>

                {/* Attachments List */}
                {(task.attachments && task.attachments.length > 0 || task.existingAttachments && task.existingAttachments.length > 0) && (
                    <div className="p-3 bg-background/50 rounded-lg border border-border/50 border-dashed text-xs space-y-2">
                        {task.existingAttachments && task.existingAttachments.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 pb-1">Saved Evidence:</p>
                                <div className="flex flex-wrap gap-2">
                                    {task.existingAttachments.map(att => (
                                        <div key={att.id} className="bg-muted px-2 py-1 rounded-lg flex items-center gap-1 border border-border/50">
                                            <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            {att.filename}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {task.attachments && task.attachments.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80 pb-1">New Pending Evidence:</p>
                                <ul className="space-y-1">
                                    {task.attachments.map((file, fIndex) => (
                                        <li key={fIndex} className="flex justify-between items-center bg-primary/5 p-1 rounded">
                                            <span className="truncate">{file.name} {(file as any).caption && <span className="opacity-70 italic">- {(file as any).caption}</span>}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFiles = [...(task.attachments || [])]
                                                    newFiles.splice(fIndex, 1)
                                                    updateTask(index, 'attachments', newFiles)
                                                }}
                                                className="text-destructive font-bold text-base leading-none px-1"
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Individual Save Button */}
                {task.id && (
                    <div className="flex justify-end pt-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSaveTask}
                            disabled={isSaving}
                            variant="secondary"
                            className="h-8 text-xs font-bold gap-2 highlight-button"
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-1">
                                    <svg className="animate-spin h-3 w-3 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving Task...
                                </span>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Save Task Changes
                                </>
                            )}
                        </Button>
                    </div>
                )}
                <input type="hidden" name={`tasks[${index}].id`} value={task.id || ''} />
            </div>
        </div>
    )
}

export default function SubmissionForm({ squads, initialData, recentDocLinks, idempotencyKey: propIdempotencyKey }: { squads: Squad[], initialData?: ProjectData, recentDocLinks?: string[], idempotencyKey?: string }) {
    const [idempotencyKey] = useState(() => propIdempotencyKey || (!initialData ? crypto.randomUUID() : ''))
    // ... rest of component
    const [slaDuration, setSlaDuration] = useState(initialData?.slaDuration || 5)
    const [files, setFiles] = useState<File[]>([])
    console.log('SubmissionForm initialData:', initialData)

    const [docLinks, setDocLinks] = useState<string[]>(() => {
        if (initialData?.docLinks && initialData.docLinks.length > 0) {
            return initialData.docLinks.map(l => l.url)
        }
        // Fallback for legacy single link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((initialData as any)?.docLink) {
            return [(initialData as any).docLink]
        }
        return ['']
    })

    // Tasks state
    const [tasks, setTasks] = useState<FollowupTask[]>(() => {
        if (initialData?.followupTasks) {
            return initialData.followupTasks.map(t => ({
                id: t.id,
                description: t.description,
                action: t.action || '',
                isCompleted: t.isCompleted,
                dueDate: new Date(t.dueDate).toISOString().split('T')[0],
                existingAttachments: (t as any).attachments || []
            }))
        }
        return []
    })

    const addTask = () => {
        setTasks([...tasks, { description: '', isCompleted: false, dueDate: '' }])
    }

    const removeTask = (index: number) => {
        const newTasks = [...tasks]
        newTasks.splice(index, 1)
        setTasks(newTasks)
    }

    const updateTask = (index: number, field: keyof FollowupTask, value: any) => {
        const newTasks = [...tasks]
        newTasks[index] = { ...newTasks[index], [field]: value }
        setTasks(newTasks)
    }

    // Controlled state for RichTextEditor
    const [description, setDescription] = useState(initialData?.description || '')
    const [mitigationNotes, setMitigationNotes] = useState(initialData?.mitigationNotes || '')

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Refs for Auto-Fill
    const nameRef = useRef<HTMLInputElement>(null)
    const typeRef = useRef<HTMLSelectElement>(null)
    const ownerSquadRef = useRef<HTMLSelectElement>(null)

    const handleAutoFill = (data: any) => {
        if (data.name && nameRef.current) nameRef.current.value = data.name
        if (data.type && typeRef.current) typeRef.current.value = data.type
        if (data.ownerSquad && ownerSquadRef.current) ownerSquadRef.current.value = data.ownerSquad

        if (data.description) setDescription(data.description)
        if (data.slaDuration) setSlaDuration(data.slaDuration)

        // Flash effect or toast could go here
    }

    const addDocLink = () => {
        setDocLinks([...docLinks, ''])
    }

    const removeDocLink = (index: number) => {
        const newLinks = [...docLinks]
        newLinks.splice(index, 1)
        setDocLinks(newLinks)
    }

    const handleDocLinkChange = (index: number, value: string) => {
        const newLinks = [...docLinks]
        newLinks[index] = value
        setDocLinks(newLinks)
    }

    // (Removed duplicate handle paste event)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles].slice(0, 20))
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        // Remove dummy attachment input if present to avoid confusion, 
        // though we are appending manually so it might simply duplicate content if we are not careful.
        // Actually since we append specific files, we can just append them.
        // But formData already contains everything from the form inputs.
        // We just need to add the files from state.

        // Remove the dummy file input from formData
        formData.delete('attachments_dummy')

        files.forEach((file, index) => {
            formData.append('attachments', file)
            formData.append('attachment_captions', (file as any).caption || '')
        })

        // Handle per-task attachments
        tasks.forEach((task, index) => {
            if (task.attachments && task.attachments.length > 0) {
                task.attachments.forEach((file) => {
                    formData.append(`tasks[${index}].attachments`, file)
                    formData.append(`tasks[${index}].attachment_captions`, (file as any).caption || '')
                })
            }
        })

        try {
            let result;
            if (initialData?.id) {
                result = await updateProject(initialData.id, formData)
            } else {
                result = await submitProject(formData)
            }

            if (result?.error) {
                alert(result.error)
                console.error("Server Action returned error:", result.error)
            }
        } catch (error) {
            console.error("Submission failed (Client Side):", error)
        }
    }

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return ''
        return new Date(date).toISOString().split('T')[0]
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {idempotencyKey && <input type="hidden" name="idempotencyKey" value={idempotencyKey} />}
            <AutoSuggest onApply={handleAutoFill} />

            <Card>
                <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                    <CardDescription>Basic details about the submission.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            defaultValue={initialData?.name}
                            placeholder="e.g. New Payment Gateway Integration"
                            ref={nameRef}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Describe the project goal, scope, and key features..."
                        />
                        <input type="hidden" name="description" value={description} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Submission Type</Label>
                            <Select
                                id="type"
                                name="type"
                                defaultValue={initialData?.type}
                                ref={typeRef}
                            >
                                <option>New Service</option>
                                <option>Major Change</option>
                                <option>Tech Refresh</option>
                                <option>Deprecation</option>
                                <option>Normal Change</option>
                                <option>Bug Fixing</option>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label>Documentation Links</Label>
                            {docLinks.map((link, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        name="docLinks"
                                        type="url"
                                        list="doc-links"
                                        value={link || ''}
                                        onChange={(e) => handleDocLinkChange(index, e.target.value)}
                                        placeholder="https://confluence..."
                                        className="flex-1"
                                    />
                                    {docLinks.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDocLink(index)}>
                                            <span className="sr-only">Remove</span>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addDocLink} className="mt-2">
                                + Add Link
                            </Button>

                            {recentDocLinks && recentDocLinks.length > 0 && (
                                <datalist id="doc-links">
                                    {recentDocLinks.map((link, i) => (
                                        <option key={i} value={link} />
                                    ))}
                                </datalist>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ownership & Timeline</CardTitle>
                    <CardDescription>Who is responsible and when is it happening.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ownerSquad">Owner / Squad</Label>
                            <Select
                                id="ownerSquad"
                                name="ownerSquad"
                                required
                                defaultValue={initialData?.ownerSquad}
                                ref={ownerSquadRef}
                            >
                                <option value="">Select a Squad</option>
                                {squads.map((squad) => (
                                    <option key={squad.id} value={squad.name}>{squad.name}</option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pic">PIC</Label>
                            <Input id="pic" name="pic" required defaultValue={initialData?.pic} placeholder="Person in Charge" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="submissionDate">Submission Date</Label>
                            <DatePicker
                                id="submissionDate"
                                name="submissionDate"
                                defaultValue={formatDate(initialData?.submissionDate ?? new Date())}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reviewDate">Review Date</Label>
                            <DatePicker
                                id="reviewDate"
                                name="reviewDate"
                                defaultValue={formatDate(initialData?.reviewDate)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slaDuration">Target SLA (workdays)</Label>
                            <Input
                                id="slaDuration"
                                name="slaDuration"
                                type="number"
                                min="1"
                                value={slaDuration}
                                onChange={(e) => setSlaDuration(parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Review & Decision</CardTitle>
                    <CardDescription>Status and outcome of the review.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select id="status" name="status" defaultValue={initialData?.status}>
                                <option>Submitted</option>
                                <option>In-Review</option>
                                <option>Revision Needed</option>
                                <option>Approved</option>
                                <option>Rejected</option>
                                <option>Archived</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="decisionDate">Decision Date</Label>
                            <DatePicker
                                id="decisionDate"
                                name="decisionDate"
                                defaultValue={formatDate(initialData?.decisionDate)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="decision">Decision Result</Label>
                        <Select id="decision" name="decision" defaultValue={initialData?.decision || ''}>
                            <option value="">- Select Decision -</option>
                            <option>Approved</option>
                            <option>Approved with Conditions</option>
                            <option>Rejected</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mitigationNotes">Decision Notes / Mitigation</Label>
                        <RichTextEditor
                            value={mitigationNotes}
                            onChange={setMitigationNotes}
                            placeholder="Additional notes, conditions or mitigation strategies..."
                        />
                        <input type="hidden" name="mitigationNotes" value={mitigationNotes} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Follow-up Tasks</CardTitle>
                    <CardDescription>Actionable items to be tracked.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Tasks List */}
                    <div className="space-y-4">
                        {tasks.map((task, index) => (
                            <TaskItem
                                key={index}
                                task={task}
                                index={index}
                                updateTask={updateTask}
                                removeTask={removeTask}
                            />
                        ))}
                    </div>

                    <Button type="button" variant="outline" size="sm" onClick={addTask} className="w-full">
                        + Add Task
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                    <CardDescription>Upload relevant documents (Max 20, up to 10MB each).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mt-1">
                        <ImageUploaderWithCaption
                            onUpload={async (file, caption) => {
                                // Add to local state (wrapper as File with caption metadata is tricky since File is immutable)
                                // We can wrap it in a local object
                                // But handleSubmit expects 'files' array.
                                // We also need to send captions.
                                // Let's just store them in a new state `pendingAttachments: {file: File, caption: string}[]`
                                // For now, let's adapt:
                                const newFile = file as any
                                newFile.caption = caption
                                setFiles(prev => [...prev, newFile])
                            }}
                            triggerText="Paste image or click to upload"
                            className="w-full"
                            enableGlobalPaste={true}
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-foreground">New Files to Upload:</h4>
                            <ul className="mt-2 divide-y divide-border/50 border border-border/50 rounded-lg">
                                {files.map((file, index) => (
                                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                        <div className="w-0 flex-1 flex items-center">
                                            <div className="flex flex-col">
                                                <span className="truncate font-medium">{file.name}</span>
                                                {(file as any).caption && <span className="text-xs text-muted-foreground italic truncate">"{(file as any).caption}"</span>}
                                            </div>
                                            <span className="ml-2 text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <button type="button" onClick={() => removeFile(index)} className="font-medium text-destructive hover:text-destructive/90">
                                                Remove
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {initialData?.attachments && initialData.attachments.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-foreground">Existing Attachments:</h4>
                            <ul className="mt-2 divide-y divide-border border rounded-md">
                                {initialData.attachments.map((file) => (
                                    <li key={file.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                        <div className="w-0 flex-1 flex items-center">
                                            <span className="truncate">{file.filename}</span>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <span className="text-muted-foreground text-xs">(Existing)</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" size="lg" className="w-full md:w-auto">
                    {initialData ? 'Update Project' : 'Submit Request'}
                </Button>
            </div>
        </form >
    )
}
