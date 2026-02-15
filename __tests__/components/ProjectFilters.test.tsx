import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProjectFilters from '../../app/components/ProjectFilters'
import '@testing-library/jest-dom'

// Mock next/navigation
const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => '/dashboard',
}))

describe('ProjectFilters Component', () => {
    beforeEach(() => {
        mockPush.mockClear()
        // Reset search params provided by mock (simulated)
        // Note: The simple mock structure above returns a constant instance. 
        // Real implementation often needs a way to set these for specific tests.
        // For now we test logic that depends on interaction.
    })

    it('renders static filters correctly', () => {
        render(<ProjectFilters />)
        expect(screen.getByLabelText('Status')).toBeInTheDocument()
        expect(screen.getByLabelText('Decision')).toBeInTheDocument()
    })

    it('updates URL when status filter changes', () => {
        render(<ProjectFilters />)
        const statusSelect = screen.getByLabelText('Status')

        fireEvent.change(statusSelect, { target: { value: 'Submitted' } })

        expect(mockPush).toHaveBeenCalledWith('/dashboard?status=Submitted')
    })

    it('updates URL when decision filter changes', () => {
        render(<ProjectFilters />)
        const decisionSelect = screen.getByLabelText('Decision')

        fireEvent.change(decisionSelect, { target: { value: 'Approved' } })

        expect(mockPush).toHaveBeenCalledWith('/dashboard?decision=Approved')
    })

    it('renders default sort correctly', () => {
        render(<ProjectFilters />)
        // "updatedAt" is "Last Updated"
        // "desc" is "Descending (Z-A)"

        // We can check if the select values are correct
        const selects = screen.getAllByRole('combobox')
        // 0: Status, 1: Decision, 2: Sort Field 1, 3: Sort Dir 1
        expect(selects[2]).toHaveValue('updatedAt')
        expect(selects[3]).toHaveValue('desc')
    })

    it('adds a new sort condition', () => {
        render(<ProjectFilters />)
        const addButton = screen.getByText('Add Sort Condition')

        fireEvent.click(addButton)

        // Should trigger push with 2 sorts. Default new is updatedAt-desc.
        // Existing default is updatedAt-desc.
        // So: updatedAt-desc,updatedAt-desc
        expect(mockPush).toHaveBeenCalledWith('/dashboard?sortBy=updatedAt-desc%2CupdatedAt-desc')

        // UI should show another row
        const sortLabels = screen.getAllByText(/Sort by|Then by/)
        expect(sortLabels).toHaveLength(2)
    })

    it('removes a sort condition', () => {
        // Need to simulate multiple sorts present first.
        // Since we can't easily change the hook return value inside this simple structure without helper,
        // we rely on internal state interaction.
        render(<ProjectFilters />)

        // Add one first
        fireEvent.click(screen.getByText('Add Sort Condition'))

        // Now remove the second one (index 1)
        // The remove button is an icon button. We can find it by className or Icon usage.
        // Lucide X Icon usually creates an SVG.
        // We can look for the button with specific class or aria-label if we added one (we didn't).
        // Let's rely on container structure or querySelector

        const removeButtons = document.querySelectorAll('button.text-muted-foreground.hover\\:text-destructive')
        // There should be 1 remove button (for the 2nd item). First item (index 0) has no remove button.
        expect(removeButtons).toHaveLength(1)

        fireEvent.click(removeButtons[0])

        // Should go back to single sort
        expect(mockPush).toHaveBeenLastCalledWith('/dashboard?sortBy=updatedAt-desc')
    })
})
import React from 'react'
