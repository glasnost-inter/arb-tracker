'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/Sheet'
import { Button } from '../../../components/ui/Button'

type Attachment = {
    id: string
    filename: string
    path: string
}

export default function AttachmentList({ attachments }: { attachments: Attachment[] }) {
    const [previewFile, setPreviewFile] = useState<Attachment | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [zoom, setZoom] = useState(1)

    const handlePreview = (file: Attachment) => {
        setPreviewFile(file)
        setIsOpen(true)
        setZoom(1) // Reset zoom on open
    }

    const isImage = (filename: string) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
    }

    const isPdf = (filename: string) => {
        return /\.pdf$/i.test(filename)
    }

    return (
        <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachments.map((file) => (
                    <li key={file.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                        <div className="flex items-center gap-3 truncate">
                            <svg className="h-5 w-5 text-muted-foreground flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                            <button
                                onClick={() => handlePreview(file)}
                                className="text-sm font-medium truncate hover:underline text-left"
                                title={file.filename}
                            >
                                {file.filename}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {(isImage(file.filename) || isPdf(file.filename)) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePreview(file)}
                                    className="h-8 px-2 text-xs"
                                >
                                    Preview
                                </Button>
                            )}
                            <a href={file.path} download target="_blank" className="text-sm font-medium text-primary hover:underline ml-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </a>
                        </div>
                    </li>
                ))}
            </ul>

            <Sheet open={isOpen} onOpenChange={setIsOpen} side="right" className="w-screen max-w-none sm:max-w-none border-l-0">
                <SheetContent className="p-0 gap-0 h-full flex flex-col">
                    <SheetHeader className="px-6 py-4 border-b">
                        <SheetTitle>{previewFile?.filename}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 w-full h-full overflow-hidden flex flex-col bg-slate-100 relative">
                        {previewFile && isImage(previewFile.filename) && (
                            <>
                                <div className="absolute top-4 right-4 z-10 flex gap-2 justify-end">
                                    <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
                                            className="h-8 w-8 p-0"
                                            title="Zoom Out"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13 10H7" />
                                            </svg>
                                        </Button>
                                        <span className="flex items-center text-xs font-medium w-10 justify-center">
                                            {Math.round(zoom * 100)}%
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setZoom(z => Math.min(5, z + 0.1))}
                                            className="h-8 w-8 p-0"
                                            title="Zoom In"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10 7v6m3-3H7" />
                                            </svg>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setZoom(1)}
                                            className="h-8 w-8 p-0"
                                            title="Reset Zoom"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                                <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewFile.path}
                                        alt={previewFile.filename}
                                        className="max-w-none w-full h-full object-contain transition-transform duration-200 ease-out origin-center"
                                        style={{ transform: `scale(${zoom})` }}
                                    />
                                </div>
                            </>
                        )}
                        {previewFile && isPdf(previewFile.filename) && (
                            <iframe
                                src={previewFile.path}
                                className="w-full h-full"
                                title={previewFile.filename}
                            />
                        )}
                        {previewFile && !isImage(previewFile.filename) && !isPdf(previewFile.filename) && (
                            <div className="text-center p-8 flex items-center justify-center h-full flex-col">
                                <p className="text-muted-foreground mb-4">Preview not available for this file type.</p>
                                <a
                                    href={previewFile.path}
                                    download
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                >
                                    Download File
                                </a>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
