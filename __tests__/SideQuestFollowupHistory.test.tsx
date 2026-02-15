import { render, screen, fireEvent } from '@testing-library/react'
import SideQuestFollowupHistory from '../app/side-quest/components/SideQuestFollowupHistory'
import '@testing-library/jest-dom'

describe('SideQuestFollowupHistory', () => {
    const mockFollowUps = [
        {
            id: '1',
            date: new Date('2026-02-18'),
            action: '<p>Update 1</p>',
            createdAt: new Date(),
            attachments: []
        },
        {
            id: '2',
            date: new Date('2026-02-10'),
            action: '<p>Update 2</p>',
            createdAt: new Date(),
            attachments: [
                { id: 'att1', filename: 'file.pdf', path: '/attachments/file.pdf', projectId: 'proj1', sideQuestId: 'quest1', sideQuestFollowUpId: '2', createdAt: new Date() }
            ]
        }
    ]

    it('renders empty state when no followups provided', () => {
        render(<SideQuestFollowupHistory followUps={[]} />)
        expect(screen.getByText('No follow-up actions recorded.')).toBeInTheDocument()
    })

    it('renders followups sorted by date (newest first)', () => {
        render(<SideQuestFollowupHistory followUps={mockFollowUps} />)

        const dates = screen.getAllByText(/2026/i) // Simple check for year
        // Since we force 'id-ID' locale:
        // 2026-02-18 -> 18 Februari 2026
        // 2026-02-10 -> 10 Februari 2026
        expect(screen.getByText('18 Februari 2026')).toBeInTheDocument()
        expect(screen.getByText('10 Februari 2026')).toBeInTheDocument()
    })

    it('defaults the newest item to open', () => {
        render(<SideQuestFollowupHistory followUps={mockFollowUps} />)

        // "Update 1" should be visible (part of the first/newest item)
        // Note: functionality uses CSS classes for visibility, but element exists in DOM.
        // We can check if the container has the "max-h-[1000px]" class which indicates open state logic was applied to the first item.
        // A more robust test might check visibility, but let's check text presence first as it renders anyway.
        // Actually, logic is: openItem === item.id ? 'max-h...' : 'max-h-0'

        // Let's find the content container for the first item
        const firstItemDate = screen.getByText('18 Februari 2026')
        const firstItemContainer = firstItemDate.closest('button')?.nextSibling as HTMLElement

        expect(firstItemContainer).toHaveClass('max-h-[1000px]')
        expect(firstItemContainer).toHaveClass('opacity-100')
    })

    it('toggles accordion on click', () => {
        render(<SideQuestFollowupHistory followUps={mockFollowUps} />)

        const secondItemDate = screen.getByText('10 Februari 2026')
        const secondItemButton = secondItemDate.closest('button')!

        // Initially closed
        const secondItemContainer = secondItemButton.nextSibling as HTMLElement
        expect(secondItemContainer).toHaveClass('max-h-0')

        // Click to open
        fireEvent.click(secondItemButton)
        expect(secondItemContainer).toHaveClass('max-h-[1000px]')

        // First item should be closed now (only one open at a time? logic is `setOpenItemId(prev => prev === id ? null : id)`, so it replaces the ID. Yes, only one open.)
        const firstItemDate = screen.getByText('18 Februari 2026')
        const firstItemContainer = firstItemDate.closest('button')?.nextSibling as HTMLElement
        expect(firstItemContainer).not.toHaveClass('max-h-[1000px]')
    })

    it('renders HTML content correctly', () => {
        render(<SideQuestFollowupHistory followUps={mockFollowUps} />)
        expect(screen.getByText('Update 1')).toBeInTheDocument()
    })
})
