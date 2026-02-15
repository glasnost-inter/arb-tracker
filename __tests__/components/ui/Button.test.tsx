import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/app/components/ui/Button'
import '@testing-library/jest-dom'

describe('Button Component', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>)
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('bg-primary text-primary-foreground') // default variant
    })

    it('renders different variants correctly', () => {
        const { rerender } = render(<Button variant="destructive">Destructive</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-destructive')

        rerender(<Button variant="outline">Outline</Button>)
        expect(screen.getByRole('button')).toHaveClass('border-input bg-background')

        rerender(<Button variant="ghost">Ghost</Button>)
        expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')

        rerender(<Button variant="link">Link</Button>)
        expect(screen.getByRole('button')).toHaveClass('text-primary underline-offset-4')
    })

    it('renders different sizes correctly', () => {
        const { rerender } = render(<Button size="sm">Small</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-9 px-3')

        rerender(<Button size="lg">Large</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-11 px-8')

        rerender(<Button size="icon">Icon</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-10 w-10')
    })

    it('handles onClick events', () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Clickable</Button>)

        fireEvent.click(screen.getByRole('button'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom</Button>)
        expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
        const ref = React.createRef<HTMLButtonElement>()
        render(<Button ref={ref}>Ref Button</Button>)
        expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
})
import React from 'react'
