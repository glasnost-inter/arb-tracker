import { render, screen } from '@testing-library/react'
import AttachmentList from '../../app/components/AttachmentList'
import '@testing-library/jest-dom'

const mockAttachments = [
    {
        id: '1',
        filename: 'document.pdf',
        path: '/attachments/document.pdf'
    },
    {
        id: '2',
        filename: 'image.png',
        path: '/attachments/image.png'
    }
]

describe('AttachmentList Component', () => {
    it('renders list of attachments', () => {
        render(<AttachmentList attachments={mockAttachments} />)

        expect(screen.getByText('document.pdf')).toBeInTheDocument()
        expect(screen.getByText('image.png')).toBeInTheDocument()
    })

    it('renders links correctly', () => {
        render(<AttachmentList attachments={mockAttachments} />)

        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(2)
        expect(links[0]).toHaveAttribute('href', '/attachments/document.pdf')
        expect(links[0]).toHaveAttribute('target', '_blank')
    })
})
import React from 'react'
