import { getSquads, getDistinctDocLinks } from '../actions'
import SubmissionForm from './SubmissionForm'
import Link from 'next/link'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'

export default async function SubmissionPage() {
    const squads = await getSquads()
    const recentDocLinks = await getDistinctDocLinks()

    return (
        <div className="min-h-screen bg-background py-12">
            <Container>
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-8 text-center">
                        Submit New ARB Request
                    </h2>
                    <SubmissionForm squads={squads} recentDocLinks={recentDocLinks} />
                </div>
            </Container>
        </div>
    )
}
