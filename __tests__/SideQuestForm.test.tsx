import { render, screen, fireEvent } from '@testing-library/react'
import { SideQuestForm } from '@/app/side-quest/SideQuestForm'
import '@testing-library/jest-dom'

// Mock actions
jest.mock('@/app/actions', () => ({
    submitSideQuest: jest.fn(),
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
}))

// Mock RTE
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

describe('SideQuestForm Component', () => {
    it('renders form fields', () => {
        render(<SideQuestForm />)

        expect(screen.getByLabelText(/Quest Name/i)).toBeInTheDocument()
        expect(screen.getByText(/Instruction/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Request Date/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Due Date/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Requestor/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Executor/i)).toBeInTheDocument()
        expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Create Side Quest/i })).toBeInTheDocument()
    })

    it('requires mandatory fields', () => {
        render(<SideQuestForm />)

        // Try to submit without filling anything
        const submitBtn = screen.getByRole('button', { name: /Create Side Quest/i })
        fireEvent.click(submitBtn)

        // Quest Name is required
        const nameInput = screen.getByLabelText(/Quest Name/i)
        expect(nameInput).toBeInvalid()

        // Due Date is required
        const dueDateInput = screen.getByLabelText(/Due Date/i)
        expect(dueDateInput).toBeInvalid()
    })
})
import React from 'react'
