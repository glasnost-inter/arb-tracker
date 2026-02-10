import { Container } from '../../components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import Link from 'next/link'
import { getSideQuestById } from '../../actions'
import { notFound } from 'next/navigation'
import { SideQuestFollowUpForm } from '../SideQuestFollowUpForm'


import AttachmentList from '../../components/AttachmentList'

export default async function SideQuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quest = await getSideQuestById(id) as any

    if (!quest) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background py-10">
            <Container>
                <div className="mb-8">
                    <Link href="/side-quest">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary mb-4">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Side Quests
                        </Button>
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                {quest.questName}
                                <Badge variant={quest.status === 'Done' ? 'completed' : 'default'}>{quest.status}</Badge>
                            </h1>
                            <p className="text-muted-foreground mt-1">{quest.ticketCode}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quest Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Instruction</h3>
                                    <p className="whitespace-pre-wrap">{quest.instruction}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">Dates</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Request Date:</span>
                                                <span>{new Date(quest.requestDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between font-medium">
                                                <span>Due Date:</span>
                                                <span className={new Date(quest.dueDate) < new Date() && quest.status !== 'Done' ? 'text-red-500' : ''}>
                                                    {new Date(quest.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {quest.finishDate && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Finished:</span>
                                                    <span>{new Date(quest.finishDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">People & Impact</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Requestor:</span>
                                                <span>{quest.requestor}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Executor:</span>
                                                <span>{quest.executor || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Impact Score:</span>
                                                <span>{quest.impactScore}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {quest.attachments && quest.attachments.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Attachments</h3>
                                        <AttachmentList attachments={quest.attachments} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Follow-up History</CardTitle>
                                <CardDescription>Track progress and updates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {quest.followUps && quest.followUps.length > 0 ? (
                                    <div className="relative border-l border-muted ml-3 space-y-8 pb-2">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {quest.followUps.map((followUp: any) => (
                                            <div key={followUp.id} className="ml-6 relative">
                                                <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                                    <span className="font-medium text-foreground">{new Date(followUp.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">{followUp.action}</p>

                                                {followUp.attachments && followUp.attachments.length > 0 && (
                                                    <div className="mt-2">
                                                        <AttachmentList attachments={followUp.attachments} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">No follow-ups yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Add Follow-up */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Add Follow-up</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <SideQuestFollowUpForm sideQuestId={quest.id} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container >
        </div >
    )
}
