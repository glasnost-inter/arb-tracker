'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent } from '../../components/ui/Card'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'

export default function SideQuestFilters() {
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
                        <option value="Submited">Submited</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Waiting Confirmation">Waiting Confirmation</option>
                    </Select>
                </div>

                {searchParams.get('status') && (
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
