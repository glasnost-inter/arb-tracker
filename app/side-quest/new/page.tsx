import { Container } from '../../components/ui/Container'
import { SideQuestForm } from '../SideQuestForm'
import { Button } from '../../components/ui/Button'
import Link from 'next/link'

export default function NewSideQuestPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">New Side Quest</h1>
                    <p className="text-muted-foreground mt-2">Create a new ad-hoc task ticket.</p>
                </div>

                <div className="flex justify-center">
                    <SideQuestForm />
                </div>
            </Container>
        </div>
    )
}
