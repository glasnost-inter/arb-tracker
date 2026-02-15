'use client'

import { useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { FilePreview } from '../../components/ui/FilePreview'

type Attachment = {
    id: string
    filename: string
    path: string
    caption?: string | null
}

type SideQuestFollowUp = {
    id: string
    date: Date
    action: string
    createdAt: Date
    attachments: Attachment[]
}

export default function SideQuestFollowupHistory({ followUps }: { followUps: SideQuestFollowUp[] }) {
    // Sort by date descending
    const sortedFollowUps = [...followUps].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Default open the first (latest) item
    const [openItemId, setOpenItemId] = useState<string | null>(sortedFollowUps.length > 0 ? sortedFollowUps[0].id : null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<Attachment | null>(null)

    const toggleItem = (id: string) => {
        setOpenItemId(prev => prev === id ? null : id)
    }

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

    if (!followUps || followUps.length === 0) {
        return <p className="text-muted-foreground italic text-sm">No follow-up actions recorded.</p>
    }

    return (
        <div className="space-y-4">
            {sortedFollowUps.map((item) => (
                <div key={item.id} className="border rounded-md bg-card overflow-hidden transition-all duration-200">
                    <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors focus:outline-none select-none"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`transition-transform duration-200 ${openItemId === item.id ? 'rotate-90' : ''}`}>
                                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <span className="font-semibold text-sm">
                                {new Date(item.date).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.attachments && item.attachments.length > 0 && (
                                <div className="flex -space-x-2 mr-2">
                                    {item.attachments.slice(0, 3).map((att) => (
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
                                    {item.attachments.length > 3 && (
                                        <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                            +{item.attachments.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </button>

                    <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${openItemId === item.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="p-4 pt-0 border-t border-muted/50">
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-4"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.action) }}
                            />

                            {/* Direct Image Preview */}
                            {item.attachments && item.attachments.some(att => isImage(att.filename)) && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {item.attachments.filter(att => isImage(att.filename)).map(att => (
                                        <div key={att.id} className="group relative rounded-md overflow-hidden border bg-muted/10 aspect-video cursor-pointer" onClick={(e) => handlePreview(e, att)}>
                                            {att.caption && <span className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded truncate max-w-[80%]">{att.caption}</span>}
                                            <img
                                                src={att.path}
                                                alt={att.filename}
                                                className="w-full h-full object-contain transition-transform group-hover:scale-105"
                                                onError={(e) => {
                                                    console.error(`[Lead Architect] SideQuest Image Load Error: ${att.path}`);
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
                            {item.attachments && item.attachments.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                                    {item.attachments.map(att => (
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
                </div>
            ))}

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
