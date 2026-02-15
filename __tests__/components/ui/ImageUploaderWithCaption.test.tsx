import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImageUploaderWithCaption } from '../../../app/components/ui/ImageUploaderWithCaption'
import userEvent from '@testing-library/user-event'

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')

// Mock ClipboardEvent
class MockClipboardEvent extends Event {
    clipboardData: {
        files: File[];
        items: any[];
    };

    constructor(type: string, options: any) {
        super(type, { bubbles: true, cancelable: true });
        this.clipboardData = options.clipboardData;
    }
}
global.ClipboardEvent = MockClipboardEvent as any;

describe('ImageUploaderWithCaption', () => {
    const mockOnUpload = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly', () => {
        render(<ImageUploaderWithCaption onUpload={mockOnUpload} />)
        expect(screen.getByText(/Paste or Upload Image/i)).toBeInTheDocument()
    })

    it('opens modal on file selection', async () => {
        const { container } = render(<ImageUploaderWithCaption onUpload={mockOnUpload} />)
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' })

        const input = container.querySelector('input[type="file"]') as HTMLInputElement
        await userEvent.upload(input, file)

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/File Preview & Caption/i)).toBeInTheDocument()
    })

    it('handles file paste', async () => {
        render(<ImageUploaderWithCaption onUpload={mockOnUpload} />)

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
        const pasteEvent = new MockClipboardEvent('paste', {
            clipboardData: {
                files: [file],
                items: [
                    {
                        kind: 'file',
                        type: 'image/png',
                        getAsFile: () => file
                    }
                ]
            }
        })

        // Dispatch paste event on window
        fireEvent(window, pasteEvent)

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        // Check if preview is shown (element with alt="Preview")
        expect(screen.getByAltText('Preview')).toBeInTheDocument()
    })

    it('allows caption input and saving', async () => {
        render(<ImageUploaderWithCaption onUpload={mockOnUpload} />)

        // Open modal and simulate file selection (requires more complex mocking if not using paste)
        // Let's use paste for simplicity as it triggers the flow
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
        const pasteEvent = new MockClipboardEvent('paste', {
            clipboardData: {
                files: [file],
                items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }]
            }
        })
        fireEvent(window, pasteEvent)

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Add a description for this image.../i)).toBeInTheDocument()
        })

        const captionInput = screen.getByPlaceholderText(/Add a description for this image.../i)
        await userEvent.type(captionInput, 'My awesome caption')

        const saveButton = screen.getByText('Save Attachment')
        fireEvent.click(saveButton)

        expect(mockOnUpload).toHaveBeenCalledWith(file, 'My awesome caption')
        // Modal should close
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('opens modal on PDF file selection and shows iframe', async () => {
        const { container } = render(<ImageUploaderWithCaption onUpload={mockOnUpload} />)
        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' })

        const input = container.querySelector('input[type="file"]') as HTMLInputElement
        await userEvent.upload(input, file)

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByTitle('PDF Preview')).toBeInTheDocument()
        expect(screen.getByTitle('PDF Preview')).toHaveAttribute('src', 'blob:mock-url')
    })

    it('handles cancel', async () => {
        render(<ImageUploaderWithCaption onUpload={mockOnUpload} />)

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
        const pasteEvent = new MockClipboardEvent('paste', {
            clipboardData: {
                files: [file],
                items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }]
            }
        })
        fireEvent(window, pasteEvent)

        await waitFor(() => {
            expect(screen.getByText('Cancel')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Cancel'))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(mockOnUpload).not.toHaveBeenCalled()
    })
})
