import { render, screen } from '@testing-library/react'
import { Badge } from '@/app/components/ui/Badge'
import '@testing-library/jest-dom'

describe('Badge Component', () => {
    it('renders correctly with default props', () => {
        render(<Badge>Status</Badge>)
        const badge = screen.getByText('Status')
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass('px-2.5 py-0.5 text-xs font-semibold')
        expect(badge).toHaveClass('bg-primary text-primary-foreground') // default variant
    })

    it('renders variants correctly', () => {
        const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)
        expect(screen.getByText('Secondary')).toHaveClass('bg-secondary text-secondary-foreground')

        rerender(<Badge variant="destructive">Destructive</Badge>)
        expect(screen.getByText('Destructive')).toHaveClass('bg-destructive text-destructive-foreground')

        rerender(<Badge variant="outline">Outline</Badge>)
        expect(screen.getByText('Outline')).toHaveClass('text-foreground')
    })

    it('renders custom variants correctly', () => {
        const { rerender } = render(<Badge variant="safe">Safe</Badge>)
        expect(screen.getByText('Safe')).toHaveClass('bg-emerald-100 text-emerald-800')

        rerender(<Badge variant="warning">Warning</Badge>)
        expect(screen.getByText('Warning')).toHaveClass('bg-amber-100 text-amber-800')

        rerender(<Badge variant="breached">Breached</Badge>)
        expect(screen.getByText('Breached')).toHaveClass('bg-rose-100 text-rose-800')

        rerender(<Badge variant="completed">Completed</Badge>)
        expect(screen.getByText('Completed')).toHaveClass('bg-slate-100 text-slate-800')
    })

    it('applies custom className', () => {
        render(<Badge className="custom-badge">Custom</Badge>)
        expect(screen.getByText('Custom')).toHaveClass('custom-badge')
    })
})
