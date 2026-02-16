
import Link from 'next/link'
import { Container } from '../components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { getSideQuests } from '../actions'
import SideQuestFilters from './components/SideQuestFilters'

import DOMPurify from 'isomorphic-dompurify'
import { PlusCircle } from 'lucide-react'

export default async function SideQuestPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedSearchParams = await searchParams
    const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quests = await getSideQuests(status) as any[]

    const sanitizeHtml = (html: string) => {
        return DOMPurify.sanitize(html)
    }

    return (
        <div className="min-h-screen bg-background py-10">
            <Container>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-[#0052D4] to-[#4364F7] bg-clip-text text-transparent">Executive Side-Quest Tracker</h1>
                        <p className="text-muted-foreground mt-2">Manage and track ad-hoc tasks.</p>
                    </div>
                    <Link href="/side-quest/new">
                        <Button className="flex gap-2 font-bold shadow-lg bg-gradient-to-r from-[#0052D4] to-[#4364F7] hover:opacity-90 transition-opacity">
                            <PlusCircle className="h-4 w-4" />
                            New Side Quest
                        </Button>
                    </Link>
                </div>

                <SideQuestFilters />

                <div className="space-y-4">
                    {quests && quests.length > 0 ? (
                        quests.map((quest) => (
                            <Card key={quest.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl text-primary">
                                                <Link href={`/side-quest/${quest.id}`} className="hover:underline">
                                                    {quest.questName}
                                                </Link>
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {quest.ticketCode}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-base font-normal px-3 py-1">
                                                Impact: {quest.impactScore}/5
                                            </Badge>
                                            <Badge variant={quest.status === 'Done' ? 'completed' : 'default'} className="text-base font-normal px-3 py-1">
                                                {quest.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div
                                        className="text-sm text-muted-foreground mb-4 line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(quest.instruction) }}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 block">Request Date:</span>
                                            <span className="text-muted-foreground">{new Date(quest.requestDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 block">Due Date:</span>
                                            <span className={new Date(quest.dueDate) < new Date() && quest.status !== 'Done' ? 'text-red-500' : 'text-muted-foreground'}>
                                                {new Date(quest.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 block">Requestor:</span>
                                            <span className="text-muted-foreground">{quest.requestor}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1 block">Executor:</span>
                                            <span className="text-muted-foreground">{quest.executor || '-'}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 flex justify-end gap-2">
                                    <Link href={`/side-quest/${quest.id}`}>
                                        <Button variant="secondary" size="sm">View Details</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-card rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No side quests found.</p>
                        </div>
                    )}
                </div>
            </Container >
        </div >
    )
}
