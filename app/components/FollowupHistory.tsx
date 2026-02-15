'use client'

import { useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { FilePreview } from './ui/FilePreview'

type Attachment = {
    id: string
    filename: string
    path: string
    caption?: string | null
}

type FollowupTask = {
    id: string
    description: string
    action?: string | null
    isCompleted: boolean
    dueDate: Date
    completedAt?: Date | null
    attachments?: Attachment[]
}

export default function FollowupHistory({ tasks }: { tasks: FollowupTask[] }) {
    if (!tasks || tasks.length === 0) {
        return <p className="text-muted-foreground italic text-sm">No follow-up tasks found.</p>
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <AccordionItem key={task.id} task={task} />
            ))}
        </div>
    )
}

function AccordionItem({ task }: { task: FollowupTask }) {
    const [isOpen, setIsOpen] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<Attachment | null>(null)

    const sanitizeHtml = (html: string) => {
        return DOMPurify.sanitize(html)
    }

    const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
    const isPdf = (filename: string) => /\.pdf$/i.test(filename)

    const handlePreview = (e: React.MouseEvent, file: Attachment) => {
        e.stopPropagation()
        setSelectedFile(file)
        setPreviewOpen(true)
    }

    return (
        <div className="border rounded-md bg-card overflow-hidden transition-all duration-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <div>
                        <span className="font-semibold text-sm">
                            {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {task.attachments && task.attachments.length > 0 && (
                        <div className="flex -space-x-2 mr-2">
                            {task.attachments.slice(0, 3).map((att) => (
                                <div key={att.id} className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                                    {isImage(att.filename) ? (
                                        <img
                                            src={att.path}
                                            alt=""
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /%3E%3C/svg%3E';
                                            }}
                                        />
                                    ) : (
                                        <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                            {task.attachments.length > 3 && (
                                <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                    +{task.attachments.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                    <Badge variant={task.isCompleted ? 'completed' : 'default'}>
                        {task.isCompleted ? 'Selesai' : 'Belum'}
                    </Badge>
                </div>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4 pt-0 border-t border-muted/50">
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-4"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(task.description) }}
                    />

                    {task.action && (
                        <div className="mt-4 p-3 rounded-md bg-muted/30 border-l-4 border-primary">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Action / Mitigation Taken:</p>
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(task.action) }}
                            />
                        </div>
                    )}

                    {/* Direct Image Preview */}
                    {task.attachments && task.attachments.some(att => isImage(att.filename)) && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {task.attachments.filter(att => isImage(att.filename)).map(att => (
                                <div key={att.id} className="group relative rounded-md overflow-hidden border bg-muted/10 aspect-video cursor-pointer" onClick={(e) => handlePreview(e, att)}>
                                    {att.caption && <span className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded truncate max-w-[80%]">{att.caption}</span>}
                                    <img
                                        src={att.path}
                                        alt={att.filename}
                                        className="w-full h-full object-contain transition-transform group-hover:scale-105"
                                        onError={(e) => {
                                            console.error(`[Lead Architect] Direct Image Load Error: ${att.path}`);
                                            const target = e.target as HTMLImageElement;
                                            target.classList.add('opacity-10');
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const errorText = document.createElement('div');
                                                errorText.className = "absolute inset-0 flex flex-col items-center justify-center text-destructive text-[10px] p-2 text-center";
                                                errorText.innerHTML = "Image Load Failed";
                                                parent.appendChild(errorText);
                                            }
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">Click to Preview</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Other Attachments / PDF Button */}
                    {task.attachments && task.attachments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                            {task.attachments.map(att => (
                                <div key={att.id} className="flex items-center gap-2">
                                    {isPdf(att.filename) ? (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 gap-2"
                                            onClick={(e) => handlePreview(e, att)}
                                        >
                                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Preview PDF ({att.filename})
                                        </Button>
                                    ) : !isImage(att.filename) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 gap-2 text-primary hover:underline hover:bg-transparent"
                                            onClick={(e) => handlePreview(e, att)}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            {att.filename}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedFile && (
                <FilePreview
                    isOpen={previewOpen}
                    onOpenChange={setPreviewOpen}
                    file={selectedFile}
                    readOnly={true}
                />
            )}
        </div>
    )
}
