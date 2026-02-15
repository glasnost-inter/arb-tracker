import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FollowupHistory from '../../app/components/FollowupHistory'
import '@testing-library/jest-dom'

// Mock FilePreview to avoid complex modal testing in simple unit test
jest.mock('../../app/components/ui/FilePreview', () => ({
    FilePreview: ({ isOpen, onOpenChange, file }: any) => (
        isOpen ? (
            <div data-testid="mock-file-preview">
                <span>{file?.filename}</span>
                <button onClick={() => onOpenChange(false)}>Close</button>
            </div>
        ) : null
    )
}))

const mockTasks = [
    {
        id: '1',
        description: '<p>Test description with image</p>',
        isCompleted: false,
        dueDate: new Date(),
        attachments: [
            {
                id: 'att1',
                filename: 'image.png',
                path: '/attachments/image.png',
                caption: 'Image Caption'
            },
            {
                id: 'att2',
                filename: 'document.pdf',
                path: '/attachments/document.pdf'
            }
        ]
    }
]

describe('FollowupHistory Component', () => {
    it('renders task and direct image previews', () => {
        render(<FollowupHistory tasks={mockTasks} />)

        // Find the accordion button and click it
        const accordionButton = screen.getByRole('button', { name: /januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember/i })
        fireEvent.click(accordionButton)

        // Check for direct image preview
        const directImage = screen.getByAltText('image.png')
        expect(directImage).toBeInTheDocument()
        expect(directImage).toHaveAttribute('src', '/attachments/image.png')

        // Check for PDF preview button
        expect(screen.getByText(/Preview PDF \(document.pdf\)/i)).toBeInTheDocument()
    })

    it('opens modal when clicking on image preview', async () => {
        render(<FollowupHistory tasks={mockTasks} />)

        const accordionButton = screen.getByRole('button', { name: /januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember/i })
        fireEvent.click(accordionButton)

        const imageContainer = screen.getByText('Click to Preview')
        fireEvent.click(imageContainer)

        await waitFor(() => {
            expect(screen.getByTestId('mock-file-preview')).toBeInTheDocument()
            expect(screen.getByText('image.png')).toBeInTheDocument()
        })
    })

    it('keeps accordion open when clicking preview', async () => {
        render(<FollowupHistory tasks={mockTasks} />)

        const accordionButton = screen.getByRole('button', { name: /januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember/i })
        fireEvent.click(accordionButton)

        // Find the image click area
        const imageContainer = screen.getByText('Click to Preview')
        fireEvent.click(imageContainer)

        // Accordion content should still be visible (max-h-[1000px])
        const detailContainer = screen.getByText(/Test description with image/i).parentElement?.parentElement?.parentElement
        expect(detailContainer).toHaveClass('max-h-[1000px]')
    })
})
