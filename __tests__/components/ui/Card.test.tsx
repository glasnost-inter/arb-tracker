import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/Card'
import '@testing-library/jest-dom'

describe('Card Component', () => {
    it('renders all subcomponents correctly', () => {
        render(
            <Card className="custom-card">
                <CardHeader className="custom-header">
                    <CardTitle className="custom-title">Card Title</CardTitle>
                    <CardDescription className="custom-desc">Card Description</CardDescription>
                </CardHeader>
                <CardContent className="custom-content">
                    <p>Content</p>
                </CardContent>
                <CardFooter className="custom-footer">
                    <button>Action</button>
                </CardFooter>
            </Card>
        )

        const card = screen.getByText('Content').closest('.custom-card')
        expect(card).toBeInTheDocument()
        expect(card).toHaveClass('rounded-lg border bg-card text-card-foreground shadow-sm')

        const title = screen.getByText('Card Title')
        expect(title).toBeInTheDocument()
        expect(title).toHaveClass('text-2xl font-semibold')
        expect(title.tagName).toBe('H3')

        expect(screen.getByText('Card Description')).toHaveClass('text-sm text-muted-foreground')
        expect(screen.getByText('Content').closest('.custom-content')).toBeInTheDocument()
        expect(screen.getByText('Action').closest('.custom-footer')).toBeInTheDocument()
    })

    it('forwards refs correctly', () => {
        const ref = React.createRef<HTMLDivElement>()
        render(<Card ref={ref}>Ref Card</Card>)
        expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
})
import React from 'react'
