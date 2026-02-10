import { getProjectById, getSquads, getDistinctDocLinks } from '../../../actions'
import SubmissionForm from '../../SubmissionForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Container } from '../../../components/ui/Container'
import { Button } from '../../../components/ui/Button'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProjectById(id)
    const squads = await getSquads()
    const recentDocLinks = await getDistinctDocLinks()

    if (!project) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <Container>
                <div className="mb-6">
                    <Link href={`/submission/${id}`}>
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Details
                        </Button>
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-8 text-center">
                        Edit ARB Request
                    </h2>
                    <div className="bg-card shadow sm:rounded-lg"> {/* SubmissionForm has Cards inside, so maybe just a div wrapper or remove bg-card here if double card looks bad. SubmissionForm uses Cards at top level so no need for extra Card here. */}
                        <SubmissionForm squads={squads} initialData={project} recentDocLinks={recentDocLinks} />
                    </div>
                </div>
            </Container>
        </div>
    )
}
