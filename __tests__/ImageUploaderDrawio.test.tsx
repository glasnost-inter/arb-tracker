
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUploaderWithCaption } from '@/app/components/ui/ImageUploaderWithCaption';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} alt={props.alt} />,
}));

// Mock Dialog component
jest.mock('@/app/components/ui/Dialog', () => ({
    Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('ImageUploaderWithCaption .drawio Support', () => {
    const mockOnUpload = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('accepts .drawio files and shows placeholder', async () => {
        render(<ImageUploaderWithCaption onUpload={mockOnUpload} />);

        const file = new File(['<mxfile></mxfile>'], 'diagram.drawio', { type: '' });
        const input = screen.getByTestId('file-input');

        // Simulate upload
        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        // Check if dialog opens
        expect(screen.getByTestId('dialog')).toBeInTheDocument();

        // Check for placeholder text
        expect(screen.getByText('Draw.io Diagram')).toBeInTheDocument();
        expect(screen.getByText('diagram.drawio')).toBeInTheDocument();

        // Ensure no image preview is shown
        const img = screen.queryByAltText('Preview');
        expect(img).not.toBeInTheDocument();
    });

    test('still previews standard images', async () => {
        render(<ImageUploaderWithCaption onUpload={mockOnUpload} />);

        const file = new File(['(binary)'], 'image.png', { type: 'image/png' });
        const input = screen.getByTestId('file-input');

        Object.defineProperty(input, 'files', { value: [file] });
        fireEvent.change(input);

        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        // Check if image is rendered
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
        // Placeholder should NOT be there
        expect(screen.queryByText('Draw.io Diagram')).not.toBeInTheDocument();
    });
});
