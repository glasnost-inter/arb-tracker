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
