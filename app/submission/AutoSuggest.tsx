'use client'

import { useState, useRef } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Loader2, Sparkles, Upload, FileText } from 'lucide-react'

type SuggestedData = {
    name?: string
    description?: string
    type?: string
    ownerSquad?: string
    slaDuration?: number
}

interface AutoSuggestProps {
    onApply: (data: SuggestedData) => void
}

export function AutoSuggest({ onApply }: AutoSuggestProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [analysisResult, setAnalysisResult] = useState<SuggestedData | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file)
                setPreviewUrl(url)
            } else {
                setPreviewUrl(null)
            }
            analyzeFile(file)
        }
    }

    const analyzeFile = async (file: File) => {
        setIsLoading(true)
        setAnalysisResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                if (res.status === 429) {
                    alert("⚠️ Kuota AI harian habis. Silakan input data secara manual.")
                    return
                }
                const errData = await res.json()
                throw new Error(errData.error || 'Analysis failed')
            }

            const data = await res.json()
            setAnalysisResult(data)
        } catch (error: any) {
            console.error(error)
            alert(`Error: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApply = () => {
        if (analysisResult) {
            onApply(analysisResult)
            setIsOpen(false)
            setPreviewUrl(null)
            setSelectedFile(null)
            setAnalysisResult(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    if (!isOpen) {
        return (
            <Button
                type="button"
                variant="outline"
                className="w-full mb-6 border-dashed border-2 py-8 bg-blue-50/50 hover:bg-blue-50 text-blue-600"
                onClick={() => setIsOpen(true)}
            >
                <Sparkles className="mr-2 h-5 w-5" />
                Auto-Fill Form with AI (Upload Image or PDF)
            </Button>
        )
    }

    return (
        <Card className="mb-8 border-blue-200 bg-blue-50/30">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center text-blue-800">
                        <Sparkles className="mr-2 h-5 w-5" />
                        AI Analysis
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded shadow-sm" />
                            ) : selectedFile ? (
                                <div className="py-8 text-blue-600">
                                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="font-medium truncate max-w-[200px] mx-auto">{selectedFile.name}</p>
                                    <p className="text-xs opacity-70">Click to change file</p>
                                </div>
                            ) : (
                                <div className="py-8 text-blue-500">
                                    <Upload className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p>Click to upload image or PDF</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center p-4 text-blue-600">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Analyzing...
                            </div>
                        )}
                    </div>

                    {/* Result Preview Section */}
                    <div className="space-y-4">
                        {analysisResult ? (
                            <div className="bg-white p-4 rounded-md border border-blue-100 shadow-sm space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Title</Label>
                                    <p className="font-medium">{analysisResult.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Type</Label>
                                    <p className="text-sm">{analysisResult.type || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Owner</Label>
                                    <p className="text-sm">{analysisResult.ownerSquad || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Est. SLA</Label>
                                    <p className="text-sm">{analysisResult.slaDuration} days</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Description</Label>
                                    <div className="text-xs text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: analysisResult.description || '' }} />
                                </div>

                                <Button className="w-full mt-2" onClick={handleApply}>
                                    Apply to Form
                                </Button>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                                Result will appear here...
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
