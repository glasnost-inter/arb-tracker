'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/Card'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Button } from './ui/Button'
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react'

// Available sort fields
const SORT_FIELDS = [
    { key: 'updatedAt', label: 'Last Updated' },
    { key: 'createdAt', label: 'Date Created' },
    { key: 'ownerSquad', label: 'Owner Squad' },
    { key: 'status', label: 'Status' },
    { key: 'decision', label: 'Decision' },
]

export default function ProjectFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [sorts, setSorts] = useState<{ field: string, dir: string }[]>([])

    // Sync sorts from URL on mount/update
    useEffect(() => {
        const sortByParam = searchParams.get('sortBy')
        if (sortByParam) {
            const parsedSorts = sortByParam.split(',').map(s => {
                const [field, dir] = s.split('-')
                return { field, dir }
            })
            setSorts(parsedSorts)
        } else {
            // Default sort
            setSorts([{ field: 'updatedAt', dir: 'desc' }])
        }
    }, [searchParams])

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const updateSorts = (newSorts: { field: string, dir: string }[]) => {
        const params = new URLSearchParams(searchParams)
        const sortByString = newSorts.map(s => `${s.field}-${s.dir}`).join(',')

        if (sortByString) {
            params.set('sortBy', sortByString)
            // Cleanup legacy sortOrder if present
            params.delete('sortOrder')
        } else {
            params.delete('sortBy')
        }
        router.push(`${pathname}?${params.toString()}`)
        // Optimistic update
        setSorts(newSorts)
    }

    const handleFieldChange = (index: number, field: string) => {
        const newSorts = [...sorts]
        newSorts[index].field = field
        updateSorts(newSorts)
    }

    const handleDirChange = (index: number, dir: string) => {
        const newSorts = [...sorts]
        newSorts[index].dir = dir
        updateSorts(newSorts)
    }

    const addSort = () => {
        // Default new sort
        const newSorts = [...sorts, { field: 'updatedAt', dir: 'desc' }]
        updateSorts(newSorts)
    }

    const removeSort = (index: number) => {
        const newSorts = sorts.filter((_, i) => i !== index)
        updateSorts(newSorts)
    }

    return (
        <Card className="mb-8">
            <CardContent className="pt-6 space-y-6">

                {/* Static Filters Section */}
                <div className="flex flex-wrap gap-6 items-end">
                    <div className="grid w-full max-w-xs gap-1.5">
                        <Label htmlFor="status-filter">Status</Label>
                        <Select
                            id="status-filter"
                            value={searchParams.get('status') || ''}
                            onChange={(e) => updateFilter('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Submitted">Submitted</option>
                            <option value="In-Review">In-Review</option>
                            <option value="Revision Needed">Revision Needed</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </Select>
                    </div>

                    <div className="grid w-full max-w-xs gap-1.5">
                        <Label htmlFor="decision-filter">Decision</Label>
                        <Select
                            id="decision-filter"
                            value={searchParams.get('decision') || ''}
                            onChange={(e) => updateFilter('decision', e.target.value)}
                        >
                            <option value="">All Decisions</option>
                            <option value="Approved">Approved</option>
                            <option value="Approved with Conditions">Approved with Conditions</option>
                            <option value="Rejected">Rejected</option>
                        </Select>
                    </div>

                    {(searchParams.get('status') || searchParams.get('decision')) && (
                        <Button
                            variant="ghost"
                            onClick={() => router.push(pathname)}
                            className="mb-0.5"
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Dynamic Sorting Section */}
                <div className="border-t pt-4">
                    <Label className="mb-3 block text-sm font-medium">Sorting</Label>
                    <div className="space-y-3">
                        {sorts.map((sort, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground w-16">
                                    {index === 0 ? 'Sort by' : 'Then by'}
                                </span>
                                <div className="w-48">
                                    <Select
                                        value={sort.field}
                                        onChange={(e) => handleFieldChange(index, e.target.value)}
                                        className="h-9"
                                    >
                                        {SORT_FIELDS.map(f => (
                                            <option key={f.key} value={f.key}>{f.label}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="w-32">
                                    <Select
                                        value={sort.dir}
                                        onChange={(e) => handleDirChange(index, e.target.value)}
                                        className="h-9"
                                    >
                                        <option value="asc">Ascending (A-Z)</option>
                                        <option value="desc">Descending (Z-A)</option>
                                    </Select>
                                </div>

                                {index > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSort(index)}
                                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addSort}
                            className="mt-2 text-xs flex items-center gap-1"
                        >
                            <Plus className="h-3 w-3" />
                            Add Sort Condition
                        </Button>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
