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
    const [pan, setPan] = React.useState({ x: 0, y: 0 })
    const [activeButton, setActiveButton] = React.useState<string | null>(null)

    // Reset zoom and pan when file changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
            setZoom(1)
            setPan({ x: 0, y: 0 })
            setActiveButton(null)
        }
    }, [isOpen, file?.path])

    if (!file) return null

    const handlePan = (dx: number, dy: number, name: string) => {
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        setActiveButton(name)
    }

    const handleZoom = (delta: number, name: string) => {
        setZoom(z => delta > 0 ? Math.min(5, z + delta) : Math.max(0.1, z + delta))
        setActiveButton(name)
    }

    const handleReset = () => {
        setZoom(1)
        setPan({ x: 0, y: 0 })
        setActiveButton('reset')
    }

    const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
    const isPdf = (filename: string) => /\.pdf$/i.test(filename)
    const isDrawio = (filename: string) => filename.endsWith('.drawio')

    const getButtonStyle = (name: string) => {
        const base = "h-10 w-10 p-0 flex items-center justify-center transition-all duration-200"
        if (activeButton === name) {
            return `${base} border-2 border-orange-500 bg-orange-50 text-orange-600 shadow-sm`
        }
        return `${base} hover:bg-muted`
    }

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
                        {/* 3x3 Navigation D-Pad (Floating) */}
                        {isImage(file.filename) && (
                            <div className="absolute top-6 right-6 z-10 bg-background/90 backdrop-blur-md p-1.5 rounded-xl shadow-xl border border-border/50 select-none">
                                <div className="grid grid-cols-3 gap-1">
                                    {/* Row 1 */}
                                    <div />
                                    <Button
                                        variant="ghost"
                                        onClick={() => handlePan(0, -50, 'up')}
                                        className={getButtonStyle('up')}
                                        aria-label="Geser ke Atas"
                                        title="Pan Up"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                        </svg>
                                    </Button>
                                    <div />

                                    {/* Row 2 */}
                                    <Button
                                        variant="ghost"
                                        onClick={() => handlePan(-50, 0, 'left')}
                                        className={getButtonStyle('left')}
                                        aria-label="Geser ke Kiri"
                                        title="Pan Left"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                        </svg>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleZoom(0.2, 'zoom-in')}
                                        className={getButtonStyle('zoom-in')}
                                        aria-label="Perbesar Dokumen"
                                        title="Zoom In"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handlePan(50, 0, 'right')}
                                        className={getButtonStyle('right')}
                                        aria-label="Geser ke Kanan"
                                        title="Pan Right"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </Button>

                                    {/* Row 3 */}
                                    <Button
                                        variant="ghost"
                                        onClick={handleReset}
                                        className={getButtonStyle('reset')}
                                        aria-label="Atur Ulang Tampilan"
                                        title="Home / Reset"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                        </svg>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handlePan(0, 50, 'down')}
                                        className={getButtonStyle('down')}
                                        aria-label="Geser ke Bawah"
                                        title="Pan Down"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleZoom(-0.2, 'zoom-out')}
                                        className={getButtonStyle('zoom-out')}
                                        aria-label="Perkecil Tampilan"
                                        title="Zoom Out"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                        </svg>
                                    </Button>
                                </div>
                                <div className="mt-2 text-center text-[10px] font-bold text-muted-foreground tabular-nums border-t pt-2">
                                    {Math.round(zoom * 100)}%
                                </div>
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
                                    style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, objectFit: 'contain' }}
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

