'use client'

import { useState } from 'react'
import { Select } from '../../components/ui/Select'
import { updateSideQuestStatus, archiveSideQuest } from '../../actions'
import { useRouter } from 'next/navigation'
import { Loader2, Archive } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/Dialog'
import { Button } from '../../components/ui/Button'

interface SideQuestStatusUpdateProps {
    sideQuestId: string
    currentStatus: string
}

export default function SideQuestStatusUpdate({ sideQuestId, currentStatus }: SideQuestStatusUpdateProps) {
    const [status, setStatus] = useState(currentStatus)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value

        if (newStatus === 'Archived') {
            setIsDialogOpen(true)
            return
        }

        setIsUpdating(true)
        setStatus(newStatus)

        const result = await updateSideQuestStatus(sideQuestId, newStatus)

        if (result.error) {
            alert(result.error)
            setStatus(currentStatus)
        } else {
            router.refresh()
        }
        setIsUpdating(false)
    }

    const handleConfirmArchive = async () => {
        setIsDialogOpen(false)
        setIsUpdating(true)
        setStatus('Archived')

        const result = await archiveSideQuest(sideQuestId)
        if (result.error) {
            alert(result.error)
            setStatus(currentStatus)
            setIsUpdating(false)
        } else {
            router.push('/side-quest')
        }
    }

    const handleCancelArchive = () => {
        setIsDialogOpen(false)
        setStatus(currentStatus)
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <div className="relative w-40">
                    <Select
                        value={status}
                        onChange={handleStatusChange}
                        disabled={isUpdating}
                        className={isUpdating ? 'opacity-50' : ''}
                    >
                        <option value="Submited">Submited</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Waiting Confirmation">Waiting Confirmation</option>
                        <option value="Archived" className="text-red-500 font-semibold">Archived</option>
                    </Select>
                    {isUpdating && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Archive className="h-5 w-5 text-destructive" />
                            Archive Side Quest
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive this side quest? This action will:
                            <ul className="mt-2 list-disc pl-5 space-y-1">
                                <li>Move it to the archives</li>
                                <li>Remove it from the active list</li>
                                <li>Preserve all follow-ups and attachments</li>
                            </ul>
                            <p className="mt-2 font-medium text-destructive">
                                ⚠️ A database backup will be created automatically before archiving.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelArchive} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmArchive} disabled={isUpdating}>
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Archiving...
                                </>
                            ) : (
                                'Confirm Archive'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
