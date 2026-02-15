import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/app/components/ui/Input'
import '@testing-library/jest-dom'
import React from 'react'

describe('Input Component', () => {
    it('renders text input correctly', () => {
        render(<Input placeholder="Enter text" />)
        const input = screen.getByPlaceholderText('Enter text')
        expect(input).toBeInTheDocument()
        expect(input).toHaveClass('flex h-10 w-full rounded-md border border-input bg-background')
    })

    it('handles value changes', () => {
        const handleChange = jest.fn()
        render(<Input onChange={handleChange} />)
        const input = screen.getByRole('textbox')

        fireEvent.change(input, { target: { value: 'test' } })
        expect(handleChange).toHaveBeenCalled()
        expect(input).toHaveValue('test')
    })

    it('renders different types', () => {
        render(<Input type="password" placeholder="Password" />)
        const input = screen.getByPlaceholderText('Password')
        expect(input).toHaveAttribute('type', 'password')
    })

    it('handles disabled state', () => {
        render(<Input disabled />)
        const input = screen.getByRole('textbox')
        expect(input).toBeDisabled()
        expect(input).toHaveClass('disabled:cursor-not-allowed disabled:opacity-50')
    })

    it('applies custom className', () => {
        render(<Input className="custom-input" />)
        const input = screen.getByRole('textbox')
        expect(input).toHaveClass('custom-input')
    })
})
