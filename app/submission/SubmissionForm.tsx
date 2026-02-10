'use client'

import { useState, useEffect, useRef } from 'react'
import { submitProject, updateProject } from '../actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'

type Squad = {
    id: number
    name: string
}

type Attachment = {
    id: string
    filename: string
    path: string
}

type ProjectData = {
    id?: string
    name: string
    description: string | null
    ownerSquad: string
    pic: string
    type: string
    docLink: string | null
    submissionDate: Date
    reviewDate: Date | null
    decisionDate: Date | null
    status: string
    decision: string | null
    mitigationNotes: string | null
    slaDuration: number
    attachments?: Attachment[]
}

export default function SubmissionForm({ squads, initialData, recentDocLinks }: { squads: Squad[], initialData?: ProjectData, recentDocLinks?: string[] }) {
    const [slaDuration, setSlaDuration] = useState(initialData?.slaDuration || 5)
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

        files.forEach(file => {
            formData.append('attachments', file)
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
                        <Label htmlFor="description">Description <span className="text-muted-foreground font-normal text-xs">(Markdown supported)</span></Label>
                        <Textarea id="description" name="description" rows={4} defaultValue={initialData?.description || ''} placeholder="Describe the project goal and scope..." />
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
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="docLink">Documentation Link</Label>
                            <Input
                                id="docLink"
                                name="docLink"
                                type="url"
                                list="doc-links"
                                defaultValue={initialData?.docLink || ''}
                                placeholder="https://confluence..."
                            />
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
                            <Input
                                id="submissionDate"
                                name="submissionDate"
                                type="date"
                                defaultValue={formatDate(initialData?.submissionDate ?? new Date())}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reviewDate">Review Date</Label>
                            <Input
                                id="reviewDate"
                                name="reviewDate"
                                type="date"
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
                            <Input
                                id="decisionDate"
                                name="decisionDate"
                                type="date"
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
                        <Label htmlFor="mitigationNotes">Decision Notes / Mitigation <span className="text-muted-foreground font-normal text-xs">(Markdown supported)</span></Label>
                        <Textarea id="mitigationNotes" name="mitigationNotes" rows={3} defaultValue={initialData?.mitigationNotes || ''} placeholder="Additional notes, conditions or mitigation strategies..." />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                    <CardDescription>Upload relevant documents (Max 20, up to 10MB each).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md relative hover:bg-muted/50 transition-colors border-input">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-muted-foreground justify-center">
                                <label htmlFor="attachments" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring">
                                    <span>Upload files</span>
                                    <input id="attachments" name="attachments_dummy" type="file" className="sr-only" multiple onChange={handleFileChange} ref={fileInputRef} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, PDF (Paste also supported)
                            </p>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-foreground">New Files to Upload:</h4>
                            <ul className="mt-2 divide-y divide-border border rounded-md">
                                {files.map((file, index) => (
                                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                        <div className="w-0 flex-1 flex items-center">
                                            <span className="truncate">{file.name}</span>
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
