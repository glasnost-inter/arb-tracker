'use client'

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './Sheet'
import { Button } from './Button'

interface FilePreviewProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    file: {
        filename: string
        path: string
        caption?: string | null
    } | null
    readOnly?: boolean
}

export function FilePreview({ isOpen, onOpenChange, file, readOnly = true }: FilePreviewProps) {
    const [zoom, setZoom] = React.useState(1)

    // Reset zoom when file changes or modal opens
    React.useEffect(() => {
        if (isOpen) setZoom(1)
    }, [isOpen, file?.path])

    if (!file) return null

    const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
    const isPdf = (filename: string) => /\.pdf$/i.test(filename)
    const isDrawio = (filename: string) => filename.endsWith('.drawio')

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange} side="right" className="w-screen max-w-none sm:max-w-none border-l-0">
            <SheetContent className="p-0 flex flex-col h-full gap-0">
                {/* Header - Clean Style */}
                <SheetHeader className="p-4 px-6 border-b shrink-0">
                    <SheetTitle className="flex flex-col gap-1 items-start font-semibold text-xl">
                        <span>{file.filename}</span>
                        {file.caption && (
                            <span className="text-sm font-normal text-slate-500 italic">
                                "{file.caption}"
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 w-full overflow-hidden flex flex-col bg-muted/30 relative">
                    {/* Preview Area */}
                    <div className="flex-1 relative flex items-center justify-center overflow-auto h-full">
                        {/* Zoom Controls (Floating) */}
                        {isImage(file.filename) && (
                            <div className="absolute top-4 right-4 z-10 flex gap-1 bg-background/80 backdrop-blur-md p-1 rounded-lg shadow-md border">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setZoom(z => Math.max(0.1, z - 0.2))}
                                    className="h-8 w-8 p-0"
                                    title="Zoom Out"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13 10H7" />
                                    </svg>
                                </Button>
                                <span className="flex items-center text-[10px] font-bold w-10 justify-center text-muted-foreground">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setZoom(z => Math.min(5, z + 0.2))}
                                    className="h-8 w-8 p-0"
                                    title="Zoom In"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10 7v6m3-3H7" />
                                    </svg>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setZoom(1)}
                                    className="h-8 w-8 p-0"
                                    title="Reset Zoom"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                    </svg>
                                </Button>
                            </div>
                        )}

                        {isDrawio(file.filename) ? (
                            <div className="flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card rounded-lg border shadow-sm max-w-md">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-orange-500 opacity-80">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <p className="font-semibold text-lg mb-1">Draw.io Diagram</p>
                                <p className="text-xs opacity-70 mb-4">{file.filename}</p>
                                <p className="text-[10px] italic bg-muted/40 px-3 py-1 rounded">No preview for .drawio files. Please download to view.</p>
                            </div>
                        ) : isPdf(file.filename) ? (
                            <iframe
                                src={file.path}
                                className="w-full h-full border-none"
                                title="PDF Preview"
                            />
                        ) : isImage(file.filename) ? (
                            <div className="w-full h-full flex items-center justify-center p-4">
                                <img
                                    src={file.path}
                                    alt="Preview"
                                    className="max-w-none transition-transform duration-200 ease-out origin-center select-none shadow-lg rounded-sm"
                                    style={{ transform: `scale(${zoom})`, objectFit: 'contain' }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            const errorDiv = document.createElement('div');
                                            errorDiv.className = "flex flex-col items-center justify-center text-destructive p-8 text-center bg-card border rounded-md shadow-sm";
                                            errorDiv.innerHTML = `
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                </svg>
                                                <p class="font-medium">Failed to load Image</p>
                                                <p class="text-xs opacity-70 mt-1">${file.filename}</p>
                                            `;
                                            parent.appendChild(errorDiv);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card border rounded-lg shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <p className="font-medium text-lg">Preview Not Available</p>
                                <p className="text-sm">{file.filename}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 px-6 border-t flex items-center justify-between gap-4">
                        <div className="text-xs text-slate-500 max-w-md truncate">
                            {file.path}
                        </div>
                        <div className="flex gap-2">
                            <a href={file.path} download={file.filename}>
                                <Button variant="outline" size="sm" className="h-9 gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 7L12 11.5 16.5 7M12 11.5V3" />
                                    </svg>
                                    Download
                                </Button>
                            </a>
                            <Button size="sm" onClick={() => onOpenChange(false)} className="h-9">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
