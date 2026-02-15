import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SubmissionForm from '@/app/submission/SubmissionForm'
import '@testing-library/jest-dom'

// Mock server actions
jest.mock('@/app/actions', () => ({
    submitProject: jest.fn(),
    updateProject: jest.fn(),
}))

// Mock RichTextEditor (it's complex and we can test it separately or mock it simply)
jest.mock('@/app/components/ui/RichTextEditor', () => ({
    __esModule: true,
    default: ({ value, onChange, placeholder }: any) => (
        <textarea
            data-testid="rich-text-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    ),
}))

const mockSquads = [
    { id: 1, name: 'Squad A' },
    { id: 2, name: 'Squad B' },
]

describe('SubmissionForm Component', () => {
    it('renders basic form fields', () => {
        render(<SubmissionForm squads={mockSquads} />)

        expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Submission Type/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Owner \/ Squad/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/PIC/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Submission Date/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Submit Request/i })).toBeInTheDocument()
    })

    it('validates required fields', async () => {
        render(<SubmissionForm squads={mockSquads} />)

        const submitBtn = screen.getByRole('button', { name: /Submit Request/i })
        fireEvent.click(submitBtn)

        // HTML5 validation prevents submission if required fields are empty.
        // JSDOM supports basic validation but might not stop the event handler if we bypass it.
        // However, we can check if invalid inputs are marked.
        const nameInput = screen.getByLabelText(/Project Name/i)
        expect(nameInput).toBeInvalid()
    })

    it('handles dynamic document links', () => {
        render(<SubmissionForm squads={mockSquads} />)

        // Initial state has 1 input
        const docInputs = screen.getAllByPlaceholderText(/https:\/\/confluence/i)
        expect(docInputs).toHaveLength(1)

        // Add link
        const addBtn = screen.getByRole('button', { name: /\+ Add Link/i })
        fireEvent.click(addBtn)

        expect(screen.getAllByPlaceholderText(/https:\/\/confluence/i)).toHaveLength(2)

        // Remove link (need to fill it or just find the remove button)
        // Remove buttons appear when > 1 link
        const removeBtns = screen.getAllByRole('button', { name: /Remove/i }) // Hidden text "Remove"
        fireEvent.click(removeBtns[0])

        expect(screen.getAllByPlaceholderText(/https:\/\/confluence/i)).toHaveLength(1)
    })

    it('handles dynamic task list', () => {
        render(<SubmissionForm squads={mockSquads} />)

        // Empty initially? No, state init is empty array.
        // But UI might show one? No, logic is map tasks.

        const addTaskBtn = screen.getByRole('button', { name: /\+ Add Task/i })
        fireEvent.click(addTaskBtn)

        expect(screen.getByPlaceholderText(/Task description/i)).toBeInTheDocument()

        // Add another
        fireEvent.click(addTaskBtn)
        expect(screen.getAllByPlaceholderText(/Task description/i)).toHaveLength(2)

        // Remove one
        const removeBtns = screen.getAllByRole('button', { name: /Remove/i })
        // Note: Doc links also have "Remove" buttons. We need to be specific or assume order.
        // Better: look within "Follow-up Tasks" section.
        // But for unit test simplicity, we can rely on total count or separate describe blocks.
        // Let's assume we clicked "Add Task", so the new remove buttons are for tasks.
        // Actually, doc link remove button only appears if > 1 doc link. Only 1 doc link by default.
        // So all visible "Remove" buttons should be for tasks.

        fireEvent.click(removeBtns[0])
        expect(screen.getAllByPlaceholderText(/Task description/i)).toHaveLength(1)
    })

    it('renders in edit mode with initial data', () => {
        const initialData = {
            id: '123',
            name: 'Existing Project',
            description: '<p>Desc</p>',
            ownerSquad: 'Squad A',
            pic: 'John Doe',
            type: 'New Service',
            docLinks: [{ id: '1', url: 'http://doc.com' }],
            submissionDate: new Date('2026-01-01'),
            reviewDate: null,
            decisionDate: null,
            status: 'Submitted',
            decision: null,
            mitigationNotes: null,
            slaDuration: 5,
            followupTasks: []
        }

        render(<SubmissionForm squads={mockSquads} initialData={initialData as any} />)

        expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument()
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Update Project/i })).toBeInTheDocument()
    })
})
import React from 'react'
