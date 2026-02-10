'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent } from './ui/Card'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Button } from './ui/Button'

export default function ProjectFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <Card className="mb-8">
            <CardContent className="flex flex-wrap gap-6 items-end pt-6">
                <div className="grid w-full max-w-sm gap-1.5">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                        id="status-filter"
                        value={searchParams.get('status') || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="In-Review">In-Review</option>
                        <option value="Revision Needed">Revision Needed</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </Select>
                </div>

                <div className="grid w-full max-w-sm gap-1.5">
                    <Label htmlFor="decision-filter">Decision</Label>
                    <Select
                        id="decision-filter"
                        value={searchParams.get('decision') || ''}
                        onChange={(e) => handleFilterChange('decision', e.target.value)}
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
            </CardContent>
        </Card>
    )
}
