'use client'

import { useState, useEffect, useRef } from 'react'
import { submitProject, updateProject } from '../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { ImageUploaderWithCaption } from '../components/ui/ImageUploaderWithCaption'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
// import { Textarea } from '../components/ui/Textarea' // Removed
import { Button } from '../components/ui/Button'
import RichTextEditor from '../components/ui/RichTextEditor'

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
    isCompleted: boolean
    dueDate: string // stored as YYYY-MM-DD string for input
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
    followupTasks?: { id: string, description: string, isCompleted: boolean, dueDate: Date }[]
}

export default function SubmissionForm({ squads, initialData, recentDocLinks }: { squads: Squad[], initialData?: ProjectData, recentDocLinks?: string[] }) {
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
                isCompleted: t.isCompleted,
                dueDate: new Date(t.dueDate).toISOString().split('T')[0]
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
            // We need to associate caption with the file.
            // Since getAll('attachments') returns array, we can send a parallel array of captions?
            // Or better, use JSON for metadata?
            // Simplest: 'attachment_captions' array with same index order.
            formData.append('attachment_captions', (file as any).caption || '')
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
            <Card>
                <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                    <CardDescription>Basic details about the submission.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input id="name" name="name" required defaultValue={initialData?.name} placeholder="e.g. New Payment Gateway Integration" />
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
                            <Select id="type" name="type" defaultValue={initialData?.type}>
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
                            <Select id="ownerSquad" name="ownerSquad" required defaultValue={initialData?.ownerSquad}>
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
                    <div className="space-y-3">
                        {tasks.map((task, index) => (
                            <div key={index} className="flex gap-2 items-start p-3 bg-muted/40 rounded-md">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        name={`tasks[${index}].description`}
                                        placeholder="Task description..."
                                        value={task.description}
                                        onChange={(e) => updateTask(index, 'description', e.target.value)}
                                        required
                                    />
                                    <div className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            <Label htmlFor={`task-date-${index}`} className="text-xs text-muted-foreground mb-1 block">Due Date</Label>
                                            <DatePicker
                                                id={`task-date-${index}`}
                                                name={`tasks[${index}].dueDate`}
                                                value={task.dueDate}
                                                onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {/* Hidden inputs for ID and completion status if needed for updates */}
                                        <input type="hidden" name={`tasks[${index}].id`} value={task.id || ''} />
                                        <input type="hidden" name={`tasks[${index}].isCompleted`} value={String(task.isCompleted)} />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90 mt-1"
                                    onClick={() => removeTask(index)}
                                >
                                    <span className="sr-only">Remove</span>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>
                        ))}

                        <Button type="button" variant="outline" size="sm" onClick={addTask} className="w-full">
                            + Add Task
                        </Button>
                    </div>
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
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-foreground">New Files to Upload:</h4>
                            <ul className="mt-2 divide-y divide-border border rounded-md">
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
        </form>
    )
}
