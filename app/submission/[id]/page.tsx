
import { getProjectById, getProjectHistory } from '../../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FollowupHistory from '../../components/FollowupHistory'
import DOMPurify from 'isomorphic-dompurify'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import AttachmentList from '../../components/AttachmentList'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await getProjectById(id) as any
    const history = await getProjectHistory(id)

    if (!project) {
        notFound()
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Approved': return 'safe' // Greenish
            case 'Rejected': return 'breached' // Reddish
            case 'In-Review': return 'warning' // Yellowish
            case 'Revision Needed': return 'warning'
            default: return 'secondary'
        }
    }

    const sanitizeHtml = (html: string) => {
        return DOMPurify.sanitize(html)
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <Container>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
                            <Badge variant={getStatusVariant(project.status)} className="text-sm px-2.5 py-0.5">
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {project.ownerSquad} • {project.type}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button variant="ghost">Back</Button>
                        </Link>
                        <Link href={`/submission/${project.id}/edit`}>
                            <Button variant="outline">Edit Project</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {project.description ? (
                                    <div
                                        className="prose prose-sm prose-slate dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.description) }}
                                    />
                                ) : (
                                    <p className="text-muted-foreground italic">No description provided.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Decision Notes / Mitigation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {project.mitigationNotes ? (
                                    <div
                                        className="prose prose-sm prose-slate dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.mitigationNotes) }}
                                    />
                                ) : (
                                    <p className="text-muted-foreground italic">No mitigation notes.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Follow-up Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {project.followupTasks && project.followupTasks.length > 0 ? (
                                    <FollowupHistory
                                        tasks={project.followupTasks.map((t: any) => ({
                                            ...t,
                                            dueDate: t.dueDate,
                                            attachments: t.attachments || []
                                        }))}
                                    />
                                ) : (
                                    <p className="text-muted-foreground italic text-sm">No follow-up tasks.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Attachments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {project.attachments && project.attachments.length > 0 ? (
                                    <AttachmentList attachments={project.attachments} />
                                ) : (
                                    <p className="text-muted-foreground italic">No attachments.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Project History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {history && history.length > 0 ? (
                                    <div className="relative border-l border-muted ml-3 space-y-6">
                                        {history.map((log) => {
                                            const changes = JSON.parse(log.changes) as { field: string, old: string, new: string }[]
                                            return (
                                                <div key={log.id} className="ml-6 relative">
                                                    <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(log.timestamp).toLocaleString()} by {log.actor || 'System'}
                                                        </span>
                                                        <div className="text-sm space-y-2 mt-1">
                                                            {changes.map((change, i) => (
                                                                <div key={i} className="bg-muted/50 p-2 rounded-md">
                                                                    <span className="font-semibold text-foreground">{change.field}:</span>{' '}
                                                                    <span className="text-destructive line-through">{change.old}</span>{' '}
                                                                    <span className="text-muted-foreground">→</span>{' '}
                                                                    <span className="text-emerald-600 font-medium">{change.new}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">No history available.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">PIC</p>
                                    <p className="text-sm font-medium">{project.pic}</p>
                                </div>
                                <div className="border-t pt-3">
                                    <p className="text-sm font-medium text-muted-foreground">Documentation</p>
                                    {project.docLinks && project.docLinks.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {project.docLinks.map((link: { id: string, url: string }) => (
                                                <li key={link.id} className="text-sm">
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                                        {link.url}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm">-</p>
                                    )}
                                </div>
                                <div className="border-t pt-3">
                                    <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                                    <p className="text-sm">{new Date(project.submissionDate).toLocaleDateString()}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">SLA & Review</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Target SLA</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm font-medium">{new Date(project.slaTarget).toLocaleDateString()}</p>
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {project.slaDuration} days
                                        </Badge>
                                    </div>
                                </div>
                                <div className="border-t pt-3">
                                    <p className="text-sm font-medium text-muted-foreground">Review Session</p>
                                    <p className="text-sm">{project.reviewDate ? new Date(project.reviewDate).toLocaleDateString() : '-'}</p>
                                </div>
                                <div className="border-t pt-3">
                                    <p className="text-sm font-medium text-muted-foreground">Decision Date</p>
                                    <p className="text-sm">{project.decisionDate ? new Date(project.decisionDate).toLocaleDateString() : '-'}</p>
                                </div>
                                <div className="border-t pt-3">
                                    <p className="text-sm font-medium text-muted-foreground">Decision</p>
                                    <p className="text-sm font-medium">{project.decision || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </div>
    )
}
