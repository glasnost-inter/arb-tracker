'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './Dialog'
import { Button } from './Button'
import { Label } from './Label'
import { Textarea } from './Textarea'
import Image from 'next/image'

interface ImageUploaderWithCaptionProps {
    onUpload: (file: File, caption: string) => Promise<void>
    triggerText?: string
    className?: string
}

export function ImageUploaderWithCaption({ onUpload, triggerText = "Paste or Upload Image", className }: ImageUploaderWithCaptionProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [caption, setCaption] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Handle Paste Event
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData && e.clipboardData.files.length > 0) {
                const file = e.clipboardData.files[0]
                if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                    handleFileSelection(file)
                }
            }
        }
        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [])

    const handleFileSelection = (file: File) => {
        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setIsOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(e.target.files[0])
        }
    }

    const handleSave = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        try {
            await onUpload(selectedFile, caption)
            setIsOpen(false)
            setCaption('')
            setSelectedFile(null)
            setPreviewUrl(null)
        } catch (error) {
            console.error('Upload failed:', error)
            alert('Failed to upload image')
        } finally {
            setIsUploading(false)
        }
    }

    const isImage = (file: File | null) => {
        return file?.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file?.name || '')
    }

    const isPdf = (file: File | null) => {
        return file?.type === 'application/pdf' || /\.pdf$/i.test(file?.name || '')
    }

    const isDrawio = (file: File | null) => {
        return file?.name.endsWith('.drawio')
    }

    return (
        <div className={className}>
            <div
                className="border-2 border-dashed border-input hover:bg-muted/50 transition-colors rounded-md p-6 flex flex-col items-center justify-center cursor-pointer text-center"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    accept="image/*,application/pdf,.drawio"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleInputChange}
                    data-testid="file-input"
                />
                <svg className="h-10 w-10 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-muted-foreground font-medium">{triggerText}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to upload or press Ctrl+V to paste</p>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen} className="max-w-[75vw] w-[75vw] h-[85vh] flex flex-col p-8">
                <DialogContent className="flex flex-col h-full gap-0 p-0 border-none">
                    <DialogHeader className="mb-6 sm:text-center">
                        <DialogTitle className="text-3xl font-bold tracking-tight">File Preview & Caption</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 w-full flex flex-row gap-10 items-stretch overflow-hidden min-h-0 py-2">
                        {/* Preview Area (Left) */}
                        <div className="flex-1 relative bg-slate-50 border rounded-lg flex items-center justify-center overflow-hidden h-full">
                            {previewUrl ? (
                                isDrawio(selectedFile) ? (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-orange-500 opacity-80">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                        <p className="font-semibold text-lg mb-1">Draw.io Diagram</p>
                                        <p className="text-sm opacity-70">{selectedFile?.name}</p>
                                    </div>
                                ) : isPdf(selectedFile) ? (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-full border-none"
                                        title="PDF Preview"
                                        onError={() => console.error("Failed to load PDF preview")}
                                    />
                                ) : isImage(selectedFile) ? (
                                    <div className="w-full h-full flex items-center justify-center p-4">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-w-full max-h-full object-contain shadow-sm rounded-sm"
                                            onError={(e) => {
                                                console.error("Failed to load image preview");
                                                (e.target as HTMLImageElement).src = "";
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                        <p className="font-medium text-lg">File Preview Not Available</p>
                                        <p className="text-sm text-center px-4">{selectedFile?.name}</p>
                                    </div>
                                )
                            ) : null}
                        </div>

                        {/* Caption Area (Right) */}
                        <div className="flex-1 flex flex-col gap-4 h-full">
                            <div className="flex-1 flex flex-col gap-2">
                                <Label htmlFor="caption" className="font-semibold text-lg">Caption / Comment</Label>
                                <Textarea
                                    id="caption"
                                    placeholder="Add a description for this image..."
                                    className="flex-1 resize-none h-full p-4 border rounded-lg text-lg"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col gap-3 sm:flex-col mt-4">
                        <Button
                            className="w-full h-12 text-base font-semibold bg-[#5c50ee] hover:bg-[#4b3fd4] text-white"
                            onClick={handleSave}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Save Attachment'}
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full h-12 text-base font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 border-none"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
