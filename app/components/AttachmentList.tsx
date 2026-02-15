'use client'

import { useState } from 'react'
import { FilePreview } from './ui/FilePreview'

type Attachment = {
    id: string
    filename: string
    path: string
    caption?: string | null
}

export default function AttachmentList({ attachments }: { attachments: Attachment[] }) {
    const [previewFile, setPreviewFile] = useState<Attachment | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handlePreview = (file: Attachment) => {
        setPreviewFile(file)
        setIsOpen(true)
    }

    const isImage = (filename: string) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
    }

    const isDrawio = (filename: string, mimeType?: string) => {
        return filename.endsWith('.drawio') || mimeType === 'application/vnd.jgraph.mxfile'
    }

    return (
        <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {attachments.map((file) => (
                    <li key={file.id} className="group relative flex flex-col justify-between border rounded-md bg-card overflow-hidden hover:shadow-md transition-shadow">
                        {/* Preview Area */}
                        <div
                            className="relative aspect-video w-full bg-muted/30 cursor-pointer overflow-hidden border-b"
                            onClick={() => handlePreview(file)}
                        >
                            {isImage(file.filename) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={file.path}
                                    alt={file.caption || file.filename}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : isDrawio(file.filename, (file as any).mimeType) ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-orange-600 bg-orange-50 dark:bg-orange-950/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <span className="text-xs font-medium">Draw.io Diagram</span>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/10">
                                    <svg className="h-10 w-10 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-sm font-medium truncate group-hover:text-primary transition-colors cursor-pointer"
                                        title={file.filename}
                                        onClick={() => handlePreview(file)}
                                    >
                                        {file.filename}
                                    </p>
                                    {file.caption ? (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={file.caption}>
                                            "{file.caption}"
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground/50 mt-1 italic">
                                            No caption
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center pt-0.5">
                                    <a
                                        href={file.path}
                                        download
                                        target="_blank"
                                        className="text-muted-foreground hover:text-primary p-1 rounded-md hover:bg-muted transition-colors"
                                        title="Download"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <FilePreview
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                file={previewFile}
                readOnly={true}
            />
        </>
    )
}
